'use strict';
const express = require('express');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { now, getSetting, setSetting, audit } = require('./db');
const A = require('./auth');

const STATE_SCHEMA = 1;
const MODES = ['single', 'coop'];
const DIFFS = ['leicht', 'normal', 'schwer'];

function createApi({ db, dataDir, version, cookieSecure, aiUrl }) {
  const r = express.Router();
  r.use(A.requireCsrfHeader);

  const err = (res, code, msg) => res.status(code).json({ error: msg });
  const userById = id => db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  const userByName = n => db.prepare('SELECT * FROM users WHERE username = ?').get(n);
  const userCount = () => db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  const maintenance = () => getSetting(db, 'maintenance') === '1';
  const blockedByMaintenance = u => maintenance() && (!u || u.role !== 'admin');

  /* ---------- Status and first-run setup ---------- */
  r.get('/status', (req, res) => {
    res.json({
      version,
      serverName: getSetting(db, 'server_name'),
      needsSetup: userCount() === 0,
      registration: getSetting(db, 'registration'),
      maintenance: maintenance(),
      user: req.user ? A.publicUser(req.user) : null
    });
  });

  r.post('/setup', (req, res) => {
    if (userCount() > 0) return err(res, 409, 'Der Server ist bereits eingerichtet.');
    const { username, password, email, serverName } = req.body || {};
    const p = A.usernameProblem(username) || A.passwordProblem(password);
    if (p) return err(res, 400, p);
    const info = db.prepare('INSERT INTO users (username, display, email, pw_hash, role, created_at, last_login) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(username, username, String(email || ''), A.hashPassword(password), 'admin', now(), now());
    if (serverName && String(serverName).trim()) setSetting(db, 'server_name', String(serverName).trim().slice(0, 60));
    audit(db, 'Ersteinrichtung', 'Admin-Konto ' + username + ' angelegt', username);
    A.createSession(db, res, Number(info.lastInsertRowid), cookieSecure);
    res.json({ user: A.publicUser(userById(info.lastInsertRowid)) });
  });

  /* ---------- Login, logout, registration ---------- */
  r.post('/auth/login', (req, res) => {
    const { username, password } = req.body || {};
    const u = userByName(String(username || ''));
    if (!u) { audit(db, 'Login fehlgeschlagen', 'Unbekannter Benutzer ' + String(username || '').slice(0, 40), '', 'WARN'); return err(res, 401, 'Benutzername oder Kennwort ist falsch.'); }
    if (u.locked) { audit(db, 'Login abgelehnt', u.username + ' ist gesperrt', u.username, 'WARN'); return err(res, 423, 'Dieses Konto ist gesperrt. Bitte wende dich an den Server-Admin.'); }
    if (!A.verifyPassword(String(password || ''), u.pw_hash)) {
      const failed = u.failed + 1;
      const lock = failed >= A.LOCK_AFTER ? 1 : 0;
      db.prepare('UPDATE users SET failed = ?, locked = ? WHERE id = ?').run(failed, lock, u.id);
      audit(db, 'Login fehlgeschlagen', u.username + ' (' + failed + ' Fehlversuche' + (lock ? ', gesperrt' : '') + ')', u.username, 'WARN');
      return err(res, lock ? 423 : 401, lock ? 'Zu viele Fehlversuche. Das Konto ist jetzt gesperrt.' : 'Benutzername oder Kennwort ist falsch.');
    }
    if (blockedByMaintenance(u)) return err(res, 503, 'Der Server ist im Wartungsmodus. Bitte später erneut versuchen.');
    db.prepare('UPDATE users SET failed = 0, last_login = ? WHERE id = ?').run(now(), u.id);
    audit(db, 'Login', u.username, u.username);
    A.createSession(db, res, u.id, cookieSecure);
    res.json({ user: A.publicUser(userById(u.id)) });
  });

  r.post('/auth/logout', (req, res) => {
    A.clearSession(db, req, res);
    res.json({ ok: true });
  });

  r.post('/auth/register', (req, res) => {
    const mode = getSetting(db, 'registration');
    if (mode === 'closed') return err(res, 403, 'Die Registrierung ist geschlossen.');
    if (maintenance()) return err(res, 503, 'Der Server ist im Wartungsmodus.');
    const { username, password, email, invite } = req.body || {};
    const p = A.usernameProblem(username) || A.passwordProblem(password);
    if (p) return err(res, 400, p);
    if (userByName(username)) return err(res, 409, 'Diesen Benutzernamen gibt es schon.');
    let inv = null, role = 'player';
    if (mode === 'invite') {
      inv = db.prepare('SELECT * FROM invites WHERE code = ? AND used_by IS NULL').get(String(invite || '').trim().toUpperCase());
      if (!inv) return err(res, 403, 'Für die Registrierung braucht es einen gültigen Einladungscode.');
      role = inv.role;
    }
    const info = db.prepare('INSERT INTO users (username, display, email, pw_hash, role, created_at, last_login) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(username, username, String(email || ''), A.hashPassword(password), role, now(), now());
    if (inv) db.prepare('UPDATE invites SET used_by = ?, used_at = ? WHERE code = ?').run(Number(info.lastInsertRowid), now(), inv.code);
    audit(db, 'Registrierung', username + (inv ? ' mit Einladung ' + inv.code : ''), username);
    A.createSession(db, res, Number(info.lastInsertRowid), cookieSecure);
    res.json({ user: A.publicUser(userById(info.lastInsertRowid)) });
  });

  /* ---------- Own account ---------- */
  r.get('/me', A.requireUser, (req, res) => res.json({ user: A.publicUser(req.user) }));

  r.put('/me/settings', A.requireUser, (req, res) => {
    const s = req.body && req.body.settings;
    if (!s || typeof s !== 'object') return err(res, 400, 'Einstellungen fehlen.');
    const json = JSON.stringify(s);
    if (json.length > 20000) return err(res, 413, 'Einstellungen sind zu groß.');
    db.prepare('UPDATE users SET settings = ? WHERE id = ?').run(json, req.user.id);
    res.json({ ok: true });
  });

  r.put('/me/profile', A.requireUser, (req, res) => {
    const display = String((req.body || {}).display || '').trim().slice(0, 60);
    const email = String((req.body || {}).email || '').trim().slice(0, 120);
    if (display.length < 2) return err(res, 400, 'Der Anzeigename braucht mindestens 2 Zeichen.');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err(res, 400, 'Die E-Mail-Adresse ist ungültig.');
    db.prepare('UPDATE users SET display = ?, email = ? WHERE id = ?').run(display, email, req.user.id);
    res.json({ user: A.publicUser(userById(req.user.id)) });
  });

  r.put('/me/password', A.requireUser, (req, res) => {
    const { current, next } = req.body || {};
    if (!A.verifyPassword(String(current || ''), req.user.pw_hash)) return err(res, 403, 'Das aktuelle Kennwort stimmt nicht.');
    const p = A.passwordProblem(next);
    if (p) return err(res, 400, p);
    if (current === next) return err(res, 400, 'Das neue Kennwort muss sich vom alten unterscheiden.');
    db.prepare('UPDATE users SET pw_hash = ?, must_change = 0 WHERE id = ?').run(A.hashPassword(next), req.user.id);
    audit(db, 'Kennwort geändert', req.user.username, req.user.username);
    res.json({ ok: true });
  });

  r.get('/me/export', A.requireUser, (req, res) => {
    const saves = db.prepare('SELECT * FROM saves WHERE owner_id = ?').all(req.user.id).map(exportableSave);
    const data = { format: 'craftit-account', exportedAt: now(), user: A.publicUser(req.user), saves };
    res.setHeader('Content-Disposition', 'attachment; filename="craftit-konto-' + req.user.username + '.json"');
    res.json(data);
  });

  r.delete('/me', A.requireUser, (req, res) => {
    const { password, confirm } = req.body || {};
    if (confirm !== 'LÖSCHEN') return err(res, 400, 'Zur Bestätigung LÖSCHEN eingeben.');
    if (!A.verifyPassword(String(password || ''), req.user.pw_hash)) return err(res, 403, 'Das Kennwort stimmt nicht.');
    if (req.user.role === 'admin' && db.prepare("SELECT COUNT(*) AS c FROM users WHERE role = 'admin'").get().c <= 1) return err(res, 409, 'Das letzte Admin-Konto kann nicht gelöscht werden.');
    db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id);
    audit(db, 'Konto gelöscht', req.user.username, req.user.username, 'WARN');
    A.clearSession(db, req, res);
    res.json({ ok: true });
  });

  /* ---------- Save games ---------- */
  function memberRole(saveId, userId) {
    const m = db.prepare('SELECT role FROM save_members WHERE save_id = ? AND user_id = ?').get(saveId, userId);
    return m ? m.role : null;
  }
  function saveMeta(s, userId) {
    const members = db.prepare('SELECT u.id, u.username, u.display, m.role FROM save_members m JOIN users u ON u.id = m.user_id WHERE m.save_id = ? ORDER BY m.role DESC, u.username').all(s.id);
    return { id: s.id, name: s.name, mode: s.mode, diff: s.diff, focus: s.focus, day: s.day, rev: s.rev, createdAt: s.created_at, updatedAt: s.updated_at, owner: s.owner_id === userId, members };
  }
  function exportableSave(s) {
    let state = null;
    try { state = JSON.parse(s.state); } catch (e) { state = null; }
    return { format: 'craftit-save', schema: STATE_SCHEMA, name: s.name, mode: s.mode, diff: s.diff, focus: s.focus, day: s.day, exportedAt: now(), state };
  }
  function validState(state) {
    if (!state || typeof state !== 'object' || Array.isArray(state)) return 'Der Spielstand ist ungültig.';
    if (state.schema !== STATE_SCHEMA) return 'Der Spielstand hat ein unbekanntes Format (Version ' + state.schema + ').';
    if (JSON.stringify(state).length > 4 * 1024 * 1024) return 'Der Spielstand ist zu groß.';
    return null;
  }
  function guard(req, res) {
    if (blockedByMaintenance(req.user)) { err(res, 503, 'Der Server ist im Wartungsmodus.'); return false; }
    return true;
  }

  r.get('/saves', A.requireUser, (req, res) => {
    const rows = db.prepare('SELECT s.* FROM saves s JOIN save_members m ON m.save_id = s.id WHERE m.user_id = ? ORDER BY s.updated_at DESC').all(req.user.id);
    const owned = rows.filter(s => s.owner_id === req.user.id).length;
    res.json({ saves: rows.map(s => saveMeta(s, req.user.id)), owned, limit: Number(getSetting(db, 'max_saves')) });
  });

  function insertSave(req, res, { name, mode, diff, focus, state }) {
    const owned = db.prepare('SELECT COUNT(*) AS c FROM saves WHERE owner_id = ?').get(req.user.id).c;
    if (owned >= Number(getSetting(db, 'max_saves'))) return err(res, 409, 'Du hast schon ' + owned + ' Speicherstände. Lösche zuerst einen.');
    name = String(name || '').trim();
    if (name.length < 2 || name.length > 40) return err(res, 400, 'Der Firmenname braucht 2 bis 40 Zeichen.');
    if (!MODES.includes(mode)) return err(res, 400, 'Unbekannte Spielart.');
    if (!DIFFS.includes(diff)) return err(res, 400, 'Unbekannte Schwierigkeit.');
    const p = validState(state);
    if (p) return err(res, 400, p);
    const t = now();
    const info = db.prepare('INSERT INTO saves (owner_id, name, mode, diff, focus, day, state, rev, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)')
      .run(req.user.id, name, mode, diff, String(focus || 'it').slice(0, 20), Number(state.day) || 1, JSON.stringify(state), t, t);
    const id = Number(info.lastInsertRowid);
    db.prepare("INSERT INTO save_members (save_id, user_id, role) VALUES (?, ?, 'owner')").run(id, req.user.id);
    audit(db, 'Speicherstand angelegt', name + ' (' + mode + ', ' + diff + ')', req.user.username);
    const s = db.prepare('SELECT * FROM saves WHERE id = ?').get(id);
    res.json({ save: saveMeta(s, req.user.id) });
  }

  r.post('/saves', A.requireUser, (req, res) => {
    if (!guard(req, res)) return;
    insertSave(req, res, req.body || {});
  });

  r.post('/saves/import', A.requireUser, (req, res) => {
    if (!guard(req, res)) return;
    const f = req.body || {};
    if (f.format !== 'craftit-save') return err(res, 400, 'Das ist keine CraftIT-Speicherdatei.');
    if (f.schema !== STATE_SCHEMA) return err(res, 400, 'Die Datei hat ein unbekanntes Format (Version ' + f.schema + ').');
    insertSave(req, res, { name: f.name, mode: 'single', diff: f.diff, focus: f.focus, state: f.state });
  });

  r.get('/saves/:id', A.requireUser, (req, res) => {
    if (!guard(req, res)) return;
    const s = db.prepare('SELECT * FROM saves WHERE id = ?').get(Number(req.params.id));
    if (!s || !memberRole(s.id, req.user.id)) return err(res, 404, 'Speicherstand nicht gefunden.');
    res.json({ save: saveMeta(s, req.user.id), state: JSON.parse(s.state) });
  });

  r.put('/saves/:id', A.requireUser, (req, res) => {
    if (!guard(req, res)) return;
    const s = db.prepare('SELECT * FROM saves WHERE id = ?').get(Number(req.params.id));
    if (!s || !memberRole(s.id, req.user.id)) return err(res, 404, 'Speicherstand nicht gefunden.');
    const { state, rev } = req.body || {};
    if (Number(rev) !== s.rev) return res.status(409).json({ error: 'Der Speicherstand wurde inzwischen von jemand anderem geändert.', rev: s.rev });
    const p = validState(state);
    if (p) return err(res, 400, p);
    const nrev = s.rev + 1;
    db.prepare('UPDATE saves SET state = ?, day = ?, rev = ?, updated_at = ? WHERE id = ?').run(JSON.stringify(state), Number(state.day) || s.day, nrev, now(), s.id);
    res.json({ rev: nrev, updatedAt: now() });
  });

  r.delete('/saves/:id', A.requireUser, (req, res) => {
    const s = db.prepare('SELECT * FROM saves WHERE id = ?').get(Number(req.params.id));
    if (!s || memberRole(s.id, req.user.id) !== 'owner') return err(res, 404, 'Speicherstand nicht gefunden.');
    db.prepare('DELETE FROM saves WHERE id = ?').run(s.id);
    audit(db, 'Speicherstand gelöscht', s.name, req.user.username, 'WARN');
    res.json({ ok: true });
  });

  r.get('/saves/:id/export', A.requireUser, (req, res) => {
    const s = db.prepare('SELECT * FROM saves WHERE id = ?').get(Number(req.params.id));
    if (!s || !memberRole(s.id, req.user.id)) return err(res, 404, 'Speicherstand nicht gefunden.');
    const fname = 'craftit-' + s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-tag-' + s.day + '.json';
    res.setHeader('Content-Disposition', 'attachment; filename="' + fname + '"');
    res.json(exportableSave(s));
  });

  r.post('/saves/:id/members', A.requireUser, (req, res) => {
    const s = db.prepare('SELECT * FROM saves WHERE id = ?').get(Number(req.params.id));
    if (!s || memberRole(s.id, req.user.id) !== 'owner') return err(res, 404, 'Speicherstand nicht gefunden.');
    if (s.mode !== 'coop') return err(res, 400, 'Nur Koop-Spielstände haben Mitglieder.');
    const u = userByName(String((req.body || {}).username || ''));
    if (!u) return err(res, 404, 'Diesen Benutzer gibt es nicht.');
    if (memberRole(s.id, u.id)) return err(res, 409, u.username + ' ist schon Mitglied.');
    const count = db.prepare('SELECT COUNT(*) AS c FROM save_members WHERE save_id = ?').get(s.id).c;
    if (count >= Number(getSetting(db, 'max_members'))) return err(res, 409, 'Ein Koop-Spiel hat höchstens ' + getSetting(db, 'max_members') + ' Mitglieder.');
    db.prepare("INSERT INTO save_members (save_id, user_id, role) VALUES (?, ?, 'member')").run(s.id, u.id);
    audit(db, 'Koop-Mitglied hinzugefügt', u.username + ' zu ' + s.name, req.user.username);
    res.json({ save: saveMeta(db.prepare('SELECT * FROM saves WHERE id = ?').get(s.id), req.user.id) });
  });

  r.delete('/saves/:id/members/:uid', A.requireUser, (req, res) => {
    const s = db.prepare('SELECT * FROM saves WHERE id = ?').get(Number(req.params.id));
    const uid = Number(req.params.uid);
    if (!s) return err(res, 404, 'Speicherstand nicht gefunden.');
    const myRole = memberRole(s.id, req.user.id);
    if (!(myRole === 'owner' || (myRole === 'member' && uid === req.user.id))) return err(res, 403, 'Keine Berechtigung.');
    if (uid === s.owner_id) return err(res, 400, 'Der Besitzer kann nicht entfernt werden.');
    db.prepare('DELETE FROM save_members WHERE save_id = ? AND user_id = ?').run(s.id, uid);
    res.json({ ok: true });
  });

  /* ---------- Server admin ---------- */
  const backupDir = path.join(dataDir, 'backups');
  function listBackups() {
    if (!fs.existsSync(backupDir)) return [];
    return fs.readdirSync(backupDir).filter(f => f.endsWith('.db')).map(f => {
      const st = fs.statSync(path.join(backupDir, f));
      return { file: f, size: st.size, at: st.mtime.toISOString() };
    }).sort((a, b) => b.at.localeCompare(a.at));
  }
  function dbSize() {
    try { return fs.statSync(path.join(dataDir, 'craftit.db')).size; } catch (e) { return 0; }
  }
  function diskFree() {
    try { const s = fs.statfsSync(dataDir); return { free: s.bavail * s.bsize, total: s.blocks * s.bsize }; } catch (e) { return null; }
  }

  r.get('/admin/overview', A.requireAdmin, (req, res) => {
    const users = db.prepare(`SELECT u.id, u.username, u.display, u.email, u.role, u.locked, u.failed, u.must_change, u.created_at, u.last_login,
      (SELECT COUNT(*) FROM saves s WHERE s.owner_id = u.id) AS saves FROM users u ORDER BY u.username`).all();
    const invites = db.prepare('SELECT code, email, role, created_at, used_at FROM invites ORDER BY created_at DESC LIMIT 20').all();
    const log = db.prepare('SELECT at, level, actor, action, detail FROM audit ORDER BY id DESC LIMIT 60').all();
    let dbOk = true;
    try { db.prepare('SELECT 1').get(); } catch (e) { dbOk = false; }
    res.json({
      version,
      settings: { registration: getSetting(db, 'registration'), maintenance: maintenance(), serverName: getSetting(db, 'server_name'), maxSaves: Number(getSetting(db, 'max_saves')), maxMembers: Number(getSetting(db, 'max_members')) },
      health: { db: dbOk, dbSize: dbSize(), saves: db.prepare('SELECT COUNT(*) AS c FROM saves').get().c, sessions: db.prepare('SELECT COUNT(*) AS c FROM sessions WHERE expires_at > ?').get(now()).c, disk: diskFree(), aiConfigured: !!aiUrl },
      users, invites, log, backups: listBackups().slice(0, 10)
    });
  });

  r.put('/admin/users/:id', A.requireAdmin, (req, res) => {
    const u = userById(Number(req.params.id));
    if (!u) return err(res, 404, 'Benutzer nicht gefunden.');
    const b = req.body || {};
    const display = String(b.display == null ? u.display : b.display).trim().slice(0, 60);
    const email = String(b.email == null ? u.email : b.email).trim().slice(0, 120);
    const role = b.role == null ? u.role : b.role;
    const locked = b.locked == null ? u.locked : (b.locked ? 1 : 0);
    if (display.length < 2) return err(res, 400, 'Der Anzeigename braucht mindestens 2 Zeichen.');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err(res, 400, 'Die E-Mail-Adresse ist ungültig.');
    if (!['player', 'admin'].includes(role)) return err(res, 400, 'Unbekannte Rolle.');
    if (u.id === req.user.id && (role !== 'admin' || locked)) return err(res, 400, 'Das eigene Konto kann nicht gesperrt oder herabgestuft werden.');
    if (email && db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, u.id)) return err(res, 409, 'Diese E-Mail ist schon vergeben.');
    db.prepare('UPDATE users SET display = ?, email = ?, role = ?, locked = ?, failed = CASE WHEN ? = 0 THEN 0 ELSE failed END WHERE id = ?').run(display, email, role, locked, locked, u.id);
    if (locked) db.prepare('DELETE FROM sessions WHERE user_id = ?').run(u.id);
    audit(db, 'Benutzer geändert', u.username + ' (Rolle ' + role + (locked ? ', gesperrt' : '') + ')', req.user.username);
    res.json({ ok: true });
  });

  r.post('/admin/users/:id/unlock', A.requireAdmin, (req, res) => {
    const u = userById(Number(req.params.id));
    if (!u) return err(res, 404, 'Benutzer nicht gefunden.');
    db.prepare('UPDATE users SET locked = 0, failed = 0 WHERE id = ?').run(u.id);
    audit(db, 'Benutzer entsperrt', u.username, req.user.username);
    res.json({ ok: true });
  });

  r.post('/admin/users/:id/reset-password', A.requireAdmin, (req, res) => {
    const u = userById(Number(req.params.id));
    if (!u) return err(res, 404, 'Benutzer nicht gefunden.');
    const temp = crypto.randomBytes(9).toString('base64url');
    db.prepare('UPDATE users SET pw_hash = ?, must_change = 1, locked = 0, failed = 0 WHERE id = ?').run(A.hashPassword(temp), u.id);
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(u.id);
    audit(db, 'Kennwort zurückgesetzt', u.username, req.user.username, 'WARN');
    res.json({ temporaryPassword: temp });
  });

  r.delete('/admin/users/:id', A.requireAdmin, (req, res) => {
    const u = userById(Number(req.params.id));
    if (!u) return err(res, 404, 'Benutzer nicht gefunden.');
    if (u.id === req.user.id) return err(res, 400, 'Das eigene Konto löschst du unter Einstellungen.');
    db.prepare('DELETE FROM users WHERE id = ?').run(u.id);
    audit(db, 'Benutzer gelöscht', u.username, req.user.username, 'WARN');
    res.json({ ok: true });
  });

  r.post('/admin/invites', A.requireAdmin, (req, res) => {
    const email = String((req.body || {}).email || '').trim().slice(0, 120);
    const role = (req.body || {}).role === 'admin' ? 'admin' : 'player';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err(res, 400, 'Die E-Mail-Adresse ist ungültig.');
    const code = crypto.randomBytes(5).toString('hex').toUpperCase();
    db.prepare('INSERT INTO invites (code, email, role, created_by, created_at) VALUES (?, ?, ?, ?, ?)').run(code, email, role, req.user.id, now());
    audit(db, 'Einladung erstellt', code + (email ? ' für ' + email : '') + ' (' + role + ')', req.user.username);
    res.json({ code });
  });

  r.put('/admin/settings', A.requireAdmin, (req, res) => {
    const b = req.body || {};
    if (b.registration != null) {
      if (!['open', 'invite', 'closed'].includes(b.registration)) return err(res, 400, 'Unbekannter Registrierungsmodus.');
      setSetting(db, 'registration', b.registration);
      audit(db, 'Registrierung geändert', b.registration, req.user.username);
    }
    if (b.maintenance != null) {
      setSetting(db, 'maintenance', b.maintenance ? '1' : '0');
      if (b.maintenance) db.prepare("DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE role != 'admin')").run();
      audit(db, b.maintenance ? 'Wartungsmodus an' : 'Wartungsmodus aus', '', req.user.username, b.maintenance ? 'WARN' : 'INFO');
    }
    if (b.serverName != null) {
      const n = String(b.serverName).trim();
      if (n.length < 2 || n.length > 60) return err(res, 400, 'Der Servername braucht 2 bis 60 Zeichen.');
      setSetting(db, 'server_name', n);
    }
    res.json({ ok: true });
  });

  r.post('/admin/backup', A.requireAdmin, (req, res) => {
    fs.mkdirSync(backupDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
    const file = path.join(backupDir, 'craftit-' + stamp + '.db');
    if (fs.existsSync(file)) return err(res, 409, 'In dieser Sekunde gibt es schon eine Sicherung.');
    db.exec("VACUUM INTO '" + file.replace(/'/g, "''") + "'");
    const all = listBackups();
    all.slice(10).forEach(b => fs.unlinkSync(path.join(backupDir, b.file)));
    audit(db, 'Backup erstellt', path.basename(file), req.user.username);
    res.json({ backup: listBackups()[0] });
  });

  r.post('/admin/ai-test', A.requireAdmin, async (req, res) => {
    if (!aiUrl) return res.json({ ok: false, message: 'Kein KI-Endpunkt eingerichtet (Umgebungsvariable AI_URL). Das Spiel nutzt Vorlagen.' });
    try {
      const resp = await fetch(aiUrl.replace(/\/$/, '') + '/v1/models', { signal: AbortSignal.timeout(4000) });
      if (!resp.ok) return res.json({ ok: false, message: 'Der Endpunkt antwortet mit Status ' + resp.status + '.' });
      const body = await resp.json().catch(() => ({}));
      const model = body && body.data && body.data[0] && body.data[0].id;
      audit(db, 'KI-Endpunkt getestet', 'erreichbar' + (model ? ', Modell ' + model : ''), req.user.username);
      res.json({ ok: true, message: 'Erreichbar' + (model ? ' · Modell ' + model : '') });
    } catch (e) {
      res.json({ ok: false, message: 'Nicht erreichbar: ' + (e.name === 'TimeoutError' ? 'Zeitüberschreitung' : e.message) });
    }
  });

  r.use(require('./support').createSupport({ db }));
  r.use((req, res) => err(res, 404, 'Unbekannte Schnittstelle.'));
  return r;
}

module.exports = { createApi, STATE_SCHEMA };
