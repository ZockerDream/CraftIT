'use strict';
// SQLite storage using the built-in node:sqlite driver (no native build step).
const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');

const SCHEMA_VERSION = 1;

function openDb(file) {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 3000;');
  migrate(db);
  return db;
}

function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE COLLATE NOCASE,
      display TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      pw_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player','admin')),
      locked INTEGER NOT NULL DEFAULT 0,
      failed INTEGER NOT NULL DEFAULT 0,
      must_change INTEGER NOT NULL DEFAULT 0,
      settings TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      last_login TEXT
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS saves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      mode TEXT NOT NULL CHECK (mode IN ('single','coop')),
      diff TEXT NOT NULL CHECK (diff IN ('leicht','normal','schwer')),
      focus TEXT NOT NULL DEFAULT 'it',
      day INTEGER NOT NULL DEFAULT 1,
      state TEXT NOT NULL,
      rev INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS save_members (
      save_id INTEGER NOT NULL REFERENCES saves(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('owner','member')),
      PRIMARY KEY (save_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS invites (
      code TEXT PRIMARY KEY,
      email TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT 'player',
      created_by INTEGER,
      created_at TEXT NOT NULL,
      used_by INTEGER,
      used_at TEXT
    );
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS audit (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      at TEXT NOT NULL,
      level TEXT NOT NULL DEFAULT 'INFO',
      actor TEXT NOT NULL DEFAULT '',
      action TEXT NOT NULL,
      detail TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS support_tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      subject TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('fehler','frage','idee','konto')),
      status TEXT NOT NULL DEFAULT 'offen' CHECK (status IN ('offen','bearbeitung','beantwortet','geschlossen')),
      priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('niedrig','normal','hoch')),
      context TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      user_seen_at TEXT,
      admin_seen_at TEXT
    );
    CREATE TABLE IF NOT EXISTS support_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      author TEXT NOT NULL,
      is_admin INTEGER NOT NULL DEFAULT 0,
      internal INTEGER NOT NULL DEFAULT 0,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_support_user ON support_tickets(user_id);
    CREATE INDEX IF NOT EXISTS idx_support_msg ON support_messages(ticket_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_members_user ON save_members(user_id);
  `);
  const row = db.prepare('SELECT value FROM meta WHERE key = ?').get('schema_version');
  if (!row) db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)').run('schema_version', String(SCHEMA_VERSION));
  const defaults = { registration: 'invite', maintenance: '0', server_name: 'CraftIT', max_saves: '5', max_members: '6' };
  const ins = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  for (const [k, v] of Object.entries(defaults)) ins.run(k, v);
}

function now() { return new Date().toISOString(); }

function getSetting(db, key) {
  const r = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return r ? r.value : null;
}
function setSetting(db, key, value) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, String(value));
}
function audit(db, action, detail, actor, level) {
  db.prepare('INSERT INTO audit (at, level, actor, action, detail) VALUES (?, ?, ?, ?, ?)').run(now(), level || 'INFO', actor || '', action, detail || '');
}

module.exports = { openDb, now, getSetting, setSetting, audit, SCHEMA_VERSION };
