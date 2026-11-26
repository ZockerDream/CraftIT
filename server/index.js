'use strict';
const path = require('node:path');
const express = require('express');
const { openDb, audit } = require('./db');
const { loadUser } = require('./auth');
const { createApi } = require('./api');
const pkg = require('../package.json');

function createApp(opts = {}) {
  const dataDir = path.resolve(opts.dataDir || process.env.DATA_DIR || path.join(__dirname, '..', 'data'));
  const db = opts.db || openDb(path.join(dataDir, 'craftit.db'));
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 'loopback');

  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
    next();
  });
  app.use(express.json({ limit: '5mb' }));
  app.use(loadUser(db));
  app.use('/api', createApi({
    db,
    dataDir,
    version: pkg.version,
    cookieSecure: process.env.COOKIE_SECURE === '1',
    aiUrl: process.env.AI_URL || ''
  }));
  app.use(express.static(path.join(__dirname, '..', 'public'), { extensions: ['html'], maxAge: 0 }));
  app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));
  // JSON errors for the API, plain text otherwise
  app.use((errObj, req, res, next) => {
    if (errObj && errObj.type === 'entity.too.large') return res.status(413).json({ error: 'Die Daten sind zu groß.' });
    if (errObj && errObj.type === 'entity.parse.failed') return res.status(400).json({ error: 'Ungültiges JSON.' });
    console.error(errObj);
    res.status(500).json({ error: 'Interner Fehler.' });
  });
  return { app, db };
}

if (require.main === module) {
  const port = Number(process.env.PORT || 9150);
  const host = process.env.HOST || '0.0.0.0';
  const { app, db } = createApp();
  const server = app.listen(port, host, () => {
    audit(db, 'Server gestartet', 'Version ' + pkg.version + ' auf Port ' + port, 'system');
    console.log('CraftIT ' + pkg.version + ' läuft auf http://' + host + ':' + port);
  });
  // Docker sends SIGTERM on stop: finish open requests, then close the database cleanly.
  const stop = () => {
    server.close(() => { try { db.close(); } catch (e) { /* already closed */ } process.exit(0); });
    setTimeout(() => process.exit(0), 5000).unref();
  };
  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);
}

module.exports = { createApp };
