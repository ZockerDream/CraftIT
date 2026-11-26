'use strict';
// Support requests from players to the server admins, and the changelog page.
// Modelled on the support tickets in Compain and the changelog page in RP-Management-Board.
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const { now, audit } = require('./db');
const A = require('./auth');

const CATEGORIES = ['fehler', 'frage', 'idee', 'konto'];
const STATUSES = ['offen', 'bearbeitung', 'beantwortet', 'geschlossen'];
const PRIORITIES = ['niedrig', 'normal', 'hoch'];
const MAX_OPEN = 10;

function createSupport({ db }) {
  const r = express.Router();
  const err = (res, code, msg) => res.status(code).json({ error: msg });
  const isAdmin = u => u && u.role === 'admin';

  function unread(t, admin) {
    const seen = admin ? t.admin_seen_at : t.user_seen_at;
    const row = db.prepare('SELECT MAX(created_at) AS last FROM support_messages WHERE ticket_id = ? AND is_admin = ? AND internal = 0').get(t.id, admin ? 0 : 1);
    return !!(row && row.last && (!seen || row.last > seen));
  }
  function out(t, viewer, withMessages) {
    const owner = db.prepare('SELECT username, display FROM users WHERE id = ?').get(t.user_id) || { username: '?', display: '?' };
    const count = db.prepare('SELECT COUNT(*) AS c FROM support_messages WHERE ticket_id = ? AND internal = 0').get(t.id).c;
    const o = { id: t.id, subject: t.subject, category: t.category, status: t.status, priority: t.priority, context: t.context,
      createdAt: t.created_at, updatedAt: t.updated_at, owner: owner.display, ownerName: owner.username, mine: t.user_id === viewer.id,
      messages: count, unread: unread(t, isAdmin(viewer) && t.user_id !== viewer.id) };
    if (withMessages) {
      o.thread = db.prepare('SELECT id, author, is_admin, internal, body, created_at, user_id FROM support_messages WHERE ticket_id = ? ORDER BY id').all(t.id)
        .filter(m => !m.internal || isAdmin(viewer))
        .map(m => ({ id: m.id, author: m.author, admin: !!m.is_admin, internal: !!m.internal, body: m.body, at: m.created_at, mine: m.user_id === viewer.id }));
    }
    return o;
  }
  function get(req, res) {
    const t = db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(Number(req.params.id));
    // Someone else's ticket looks like a missing one, so ids reveal nothing.
    if (!t || (t.user_id !== req.user.id && !isAdmin(req.user))) { err(res, 404, 'Ticket nicht gefunden.'); return null; }
    return t;
  }
  function text(v, max) { return String(v == null ? '' : v).replace(/\r\n/g, '\n').trim().slice(0, max); }

  r.get('/support', A.requireUser, (req, res) => {
    const all = isAdmin(req.user) && req.query.scope === 'all';
    const rows = all ? db.prepare('SELECT * FROM support_tickets ORDER BY updated_at DESC').all()
      : db.prepare('SELECT * FROM support_tickets WHERE user_id = ? ORDER BY updated_at DESC').all(req.user.id);
    res.json({ tickets: rows.map(t => out(t, req.user, false)) });
  });

  r.get('/support/summary', A.requireUser, (req, res) => {
    const mine = db.prepare('SELECT * FROM support_tickets WHERE user_id = ?').all(req.user.id);
    let unreadCount = mine.filter(t => unread(t, false)).length;
    let waiting = 0;
    if (isAdmin(req.user)) {
      const others = db.prepare("SELECT * FROM support_tickets WHERE user_id != ? AND status != 'geschlossen'").all(req.user.id);
      waiting = others.filter(t => unread(t, true)).length;
      unreadCount += waiting;
    }
    res.json({ unread: unreadCount, waitingForAdmin: waiting });
  });

  r.post('/support', A.requireUser, (req, res) => {
    const b = req.body || {};
    const subject = text(b.subject, 120), body = text(b.body, 8000), category = b.category;
    if (subject.length < 4) return err(res, 400, 'Der Betreff braucht mindestens 4 Zeichen.');
    if (body.length < 10) return err(res, 400, 'Beschreib das Anliegen in mindestens 10 Zeichen.');
    if (!CATEGORIES.includes(category)) return err(res, 400, 'Unbekannte Kategorie.');
    const open = db.prepare("SELECT COUNT(*) AS c FROM support_tickets WHERE user_id = ? AND status != 'geschlossen'").get(req.user.id).c;
    if (open >= MAX_OPEN) return err(res, 409, 'Du hast schon ' + MAX_OPEN + ' offene Tickets. Schließe zuerst eins.');
    const t = now();
    const info = db.prepare('INSERT INTO support_tickets (user_id, subject, category, context, created_at, updated_at, user_seen_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(req.user.id, subject, category, text(b.context, 300), t, t, t);
    const id = Number(info.lastInsertRowid);
    db.prepare('INSERT INTO support_messages (ticket_id, user_id, author, is_admin, internal, body, created_at) VALUES (?, ?, ?, 0, 0, ?, ?)').run(id, req.user.id, req.user.display, body, t);
    audit(db, 'Support-Ticket erstellt', '#' + id + ' ' + subject, req.user.username);
    res.status(201).json({ ticket: out(db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(id), req.user, true) });
  });

  r.get('/support/:id', A.requireUser, (req, res) => {
    const t = get(req, res); if (!t) return;
    const field = t.user_id === req.user.id ? 'user_seen_at' : 'admin_seen_at';
    db.prepare('UPDATE support_tickets SET ' + field + ' = ? WHERE id = ?').run(now(), t.id);
    res.json({ ticket: out(db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(t.id), req.user, true) });
  });

  r.post('/support/:id/messages', A.requireUser, (req, res) => {
    const t = get(req, res); if (!t) return;
    const body = text((req.body || {}).body, 8000);
    if (body.length < 2) return err(res, 400, 'Die Nachricht ist leer.');
    const asAdmin = isAdmin(req.user) && t.user_id !== req.user.id;
    const internal = asAdmin && !!(req.body || {}).internal;
    const at = now();
    db.prepare('INSERT INTO support_messages (ticket_id, user_id, author, is_admin, internal, body, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(t.id, req.user.id, req.user.display, asAdmin ? 1 : 0, internal ? 1 : 0, body, at);
    // An admin answer marks the ticket answered; a player post reopens it.
    let status = t.status;
    if (!internal) status = asAdmin ? 'beantwortet' : 'offen';
    const seenField = asAdmin ? 'admin_seen_at' : 'user_seen_at';
    db.prepare('UPDATE support_tickets SET status = ?, updated_at = ?, ' + seenField + ' = ? WHERE id = ?').run(status, at, at, t.id);
    if (asAdmin) audit(db, internal ? 'Support: interne Notiz' : 'Support: Antwort', '#' + t.id, req.user.username);
    res.status(201).json({ ticket: out(db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(t.id), req.user, true) });
  });

  r.patch('/support/:id', A.requireUser, (req, res) => {
    const t = get(req, res); if (!t) return;
    const b = req.body || {};
    let status = t.status, priority = t.priority, category = t.category;
    if (b.status != null) {
      if (!STATUSES.includes(b.status)) return err(res, 400, 'Unbekannter Status.');
      if (!isAdmin(req.user) && !['geschlossen', 'offen'].includes(b.status)) return err(res, 403, 'Diesen Status setzen nur Admins.');
      status = b.status;
    }
    if (b.priority != null) {
      if (!isAdmin(req.user)) return err(res, 403, 'Die Priorität setzen nur Admins.');
      if (!PRIORITIES.includes(b.priority)) return err(res, 400, 'Unbekannte Priorität.');
      priority = b.priority;
    }
    if (b.category != null) {
      if (!CATEGORIES.includes(b.category)) return err(res, 400, 'Unbekannte Kategorie.');
      category = b.category;
    }
    db.prepare('UPDATE support_tickets SET status = ?, priority = ?, category = ?, updated_at = ? WHERE id = ?').run(status, priority, category, now(), t.id);
    res.json({ ticket: out(db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(t.id), req.user, true) });
  });

  r.delete('/support/:id', A.requireUser, (req, res) => {
    const t = get(req, res); if (!t) return;
    db.prepare('DELETE FROM support_tickets WHERE id = ?').run(t.id);
    audit(db, 'Support-Ticket gelöscht', '#' + t.id + ' ' + t.subject, req.user.username, 'WARN');
    res.json({ ok: true });
  });

  /* Changelog: parsed from Changelog.md, so the page always matches the shipped file */
  const changelogFile = path.join(__dirname, '..', 'Changelog.md');
  const TYPE = { added: 'new', changed: 'changed', fixed: 'fixed', removed: 'removed', security: 'security', deprecated: 'changed', technical: 'tech' };
  function parseChangelog() {
    let md = '';
    try { md = fs.readFileSync(changelogFile, 'utf8'); } catch (e) { return { versions: [] }; }
    const versions = [];
    let cur = null, type = 'changed';
    md.split(/\r?\n/).forEach(line => {
      const h = /^## \[([^\]]+)\](?:\s*-\s*(\S+))?/.exec(line);
      if (h) { cur = { version: h[1], date: h[2] || '', intro: '', changes: [] }; versions.push(cur); type = 'changed'; return; }
      if (!cur) return;
      const s = /^### (.+)/.exec(line);
      if (s) { type = TYPE[s[1].trim().toLowerCase()] || 'changed'; return; }
      const item = /^- (.+)/.exec(line);
      if (item) { cur.changes.push({ type, text: item[1].trim() }); return; }
      if (/^\s{2,}\S/.test(line) && cur.changes.length) { cur.changes[cur.changes.length - 1].text += ' ' + line.trim(); return; }
      if (line.trim() && !cur.changes.length && !/^#/.test(line)) cur.intro += (cur.intro ? ' ' : '') + line.trim();
    });
    return { versions };
  }
  r.get('/changelog', (req, res) => res.json(parseChangelog()));

  return r;
}

module.exports = { createSupport };
