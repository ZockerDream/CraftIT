'use strict';
const crypto = require('node:crypto');
const { now } = require('./db');

const COOKIE = 'craftit_sid';
const SESSION_DAYS = 30;
const LOCK_AFTER = 5;

function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(pw, salt, 64, { N: 16384, r: 8, p: 1 });
  return 'scrypt$' + salt.toString('hex') + '$' + hash.toString('hex');
}
function verifyPassword(pw, stored) {
  const parts = String(stored).split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const salt = Buffer.from(parts[1], 'hex');
  const expected = Buffer.from(parts[2], 'hex');
  const got = crypto.scryptSync(pw, salt, expected.length, { N: 16384, r: 8, p: 1 });
  return crypto.timingSafeEqual(got, expected);
}
function passwordProblem(pw) {
  if (typeof pw !== 'string' || pw.length < 8) return 'Das Kennwort braucht mindestens 8 Zeichen.';
  if (pw.length > 200) return 'Das Kennwort ist zu lang.';
  return null;
}
function usernameProblem(name) {
  if (typeof name !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{2,31}$/.test(name)) return 'Der Benutzername braucht 3 bis 32 Zeichen: Buchstaben, Ziffern, Punkt, Bindestrich, Unterstrich.';
  return null;
}

function parseCookies(header) {
  const out = {};
  String(header || '').split(';').forEach(p => {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}
function createSession(db, res, userId, secure) {
  const id = crypto.randomBytes(32).toString('hex');
  const exp = new Date(Date.now() + SESSION_DAYS * 864e5);
  db.prepare('INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run(id, userId, now(), exp.toISOString());
  res.setHeader('Set-Cookie', `${COOKIE}=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}${secure ? '; Secure' : ''}`);
}
function clearSession(db, req, res) {
  const sid = parseCookies(req.headers.cookie)[COOKIE];
  if (sid) db.prepare('DELETE FROM sessions WHERE id = ?').run(sid);
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}
function loadUser(db) {
  return (req, res, next) => {
    req.user = null;
    const sid = parseCookies(req.headers.cookie)[COOKIE];
    if (sid) {
      const row = db.prepare(`SELECT u.*, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?`).get(sid);
      if (row && row.expires_at > now() && !row.locked) req.user = row;
      else if (row) db.prepare('DELETE FROM sessions WHERE id = ?').run(sid);
    }
    next();
  };
}
function requireUser(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Bitte anmelden.' });
  next();
}
function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Bitte anmelden.' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Nur für Server-Admins.' });
  next();
}
// Simple CSRF defence: state-changing API calls must send a custom header,
// which a cross-site form or image cannot set without a CORS preflight.
function requireCsrfHeader(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.get('X-Requested-With') !== 'craftit') return res.status(400).json({ error: 'Ungültige Anfrage.' });
  next();
}
function publicUser(u) {
  let settings = {};
  try { settings = JSON.parse(u.settings || '{}'); } catch (e) { settings = {}; }
  return { id: u.id, username: u.username, display: u.display, email: u.email, role: u.role, mustChange: !!u.must_change, settings };
}

module.exports = { COOKIE, LOCK_AFTER, hashPassword, verifyPassword, passwordProblem, usernameProblem, createSession, clearSession, loadUser, requireUser, requireAdmin, requireCsrfHeader, publicUser };
