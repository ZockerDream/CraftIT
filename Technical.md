# CraftIT: Technical

Record every stack or architecture change here, with the date.

## Stack

| Area | Choice | Since |
|------|--------|-------|
| Mockup | Single HTML file with inline CSS and JavaScript, no build step | 2026-11-26 |
| Language / runtime | Node.js 22 (LTS) | 2026-11-26 |
| Backend | Express 4, JSON API under `/api` | 2026-11-26 |
| Frontend | Plain HTML, CSS and JavaScript from the mockup, no build step, served from `public/` (`index.html`, `css/app.css`, `js/app.js`) | 2026-11-26 |
| Database | SQLite via the built-in `node:sqlite` driver, file `data/craftit.db` | 2026-11-26 |
| Auth | scrypt password hashes, session cookie, CSRF header | 2026-11-26 |
| Tests | Playwright end-to-end tests with system Chrome | 2026-11-26 |
| Deployment | Docker (node:22-alpine), port 9150, volume `./data` | 2026-11-26 |

## Architecture

Version 1.0.0 (2026-11-26):

```
Browser: public/js/app.js            Server: server/*.js (Express)          data/
  game rules and all screens   --->    /api: accounts, sessions, saves  --->  craftit.db (SQLite, WAL)
  captureState() / applyState()        admin, support, changelog              backups/craftit-*.db
  autosave every 30 s (PUT rev)        static files from public/
```

- The browser runs the game. The whole game world of a save game is one JSON document (`schema: 1`), built by `captureState()` and restored by `applyState()` in `app.js`.
- The server checks accounts and access, stores the JSON per save game, and rejects stale writes: every `PUT /api/saves/:id` carries the revision it was based on; a newer revision on the server returns HTTP 409, and the player chooses to reload or overwrite.
- Autosave: every 30 s if something changed, on every page change, and when the tab is hidden. The top bar shows the state; a click saves at once. The id of the last open save is kept per account in `localStorage`, so a reload resumes it on the same page.
- `window.craftit.state()` and `window.craftit.info()` expose a read-only view for the end-to-end tests and the browser console.
- Server files: `index.js` (app, security headers, static files, shutdown), `db.js` (schema and migrations), `auth.js` (passwords, sessions, guards), `api.js` (status, auth, account, saves, admin), `support.js` (support requests, changelog).

Planned later:

```
Browser (game UI)  <-->  Game server (API + save data)  <-->  SQLite or PostgreSQL
                                  |
                                  |  OpenAI-compatible HTTP (optional)
                                  v
                         Local LLM container (llama.cpp)
```

- **Game logic is deterministic.** The AI never decides outcomes (see Concept.md section 12).
- **Content generator** has two providers: `llm` (local model) and `template` (offline). Both produce the same JSON schema. The game runs with `template` only.
- **Background job** pre-generates tickets and dialogues in batches and stores them.
- **Local LLM** follows the Compain setup: llama.cpp server, GGUF model, CPU by default, optional NVIDIA GPU. Model client is OpenAI-compatible; `mock` URL for tests.

## Mockup

- File: [mockup/craftit-mockup.html](mockup/craftit-mockup.html).
- All state lives in memory in one script. Nothing is saved, except a few viewer settings in `localStorage` (theme, notes, price sliders).
- Design tokens: CSS custom properties for light and dark, switched by `data-theme` on the root element or by the system setting.
- Tested with headless Chrome: route sweep at 1400 and 400 pixels wide, 22 app flows, 22 Active Directory flows, workbench repair path.

## Content generation

| Item | Decision | Since |
|------|----------|-------|
| Provider interface | `ContentProvider` with `llm` and `template` implementations | 2026-11-26 |
| Output format | Strict JSON schema per content type, validated before use | 2026-11-26 |
| Retry and fallback | Invalid output: retry up to 2 times, then template | 2026-11-26 |
| Pregeneration | Background batches stored in DB, player never waits on the model | 2026-11-26 |
| Filter | Forbidden-content and real-name checks before storage | 2026-11-26 |

## Data model

SQLite file `data/craftit.db`, schema version 1 (table `meta`). Since 2026-11-26.

| Table | Content |
|-------|---------|
| `users` | Account: `username` (unique, case-insensitive), `display`, `email`, `pw_hash` (scrypt), `role` (`player` or `admin`), `locked`, `failed` (failed logins, lock at 5), `must_change` (after an admin reset), `settings` (JSON: theme, preferences), timestamps |
| `sessions` | Session id (cookie `craftit_sid`, HttpOnly, SameSite=Lax, 30 days), user, expiry |
| `saves` | Save game: owner, `name`, `mode` (`single` or `coop`), `diff`, `focus`, `day`, `state` (game JSON), `rev`, timestamps |
| `save_members` | Who may play a save game: `owner` or `member` (co-op, up to 6) |
| `invites` | One-time invite codes with role, creator, and who used them |
| `settings` | Server settings: `registration` (`open`, `invite`, `closed`), `maintenance`, `server_name`, `max_saves` (5), `max_members` (6) |
| `audit` | Server log shown in the admin panel |
| `support_tickets` | Support request: user, subject, `category` (`fehler`, `frage`, `idee`, `konto`), `status` (`offen`, `bearbeitung`, `beantwortet`, `geschlossen`), `priority`, `context` (save game, version, page), read markers for player and admins |
| `support_messages` | Messages of a support request; admins can add internal notes that players never see |

## API

All routes are under `/api`. Every request that changes data needs the header `X-Requested-With: craftit` (CSRF protection). Errors are JSON `{ "error": "..." }` with German text.

| Area | Routes |
|------|--------|
| Status | `GET /status` (version, server name, setup needed, registration mode, current user) |
| Setup and login | `POST /setup` (first admin, only while no account exists), `POST /auth/login`, `POST /auth/logout`, `POST /auth/register` |
| Account | `GET /me`, `PUT /me/settings`, `PUT /me/profile`, `PUT /me/password`, `GET /me/export`, `DELETE /me` (password and the word `LÖSCHEN`) |
| Save games | `GET /saves`, `POST /saves`, `POST /saves/import`, `GET /saves/:id`, `PUT /saves/:id` (with `rev`), `DELETE /saves/:id`, `GET /saves/:id/export`, `POST /saves/:id/members`, `DELETE /saves/:id/members/:uid` |
| Admin | `GET /admin/overview`, `PUT /admin/users/:id`, `POST /admin/users/:id/unlock`, `POST /admin/users/:id/reset-password`, `DELETE /admin/users/:id`, `POST /admin/invites`, `PUT /admin/settings`, `POST /admin/backup`, `POST /admin/ai-test` |
| Support | `GET /support` (`?scope=all` for admins), `GET /support/summary`, `POST /support`, `GET /support/:id`, `POST /support/:id/messages`, `PATCH /support/:id`, `DELETE /support/:id` |
| Changelog | `GET /changelog` (parsed from `Changelog.md`) |

## Tests

- `npm test` runs Playwright (`playwright.config.js`). `tests/serve.js` starts the server on port 9152 with an empty `.test-data/` folder.
- The specs run in order and build on each other: `01-accounts` (setup, login, invite, lock, reset), `02-game` (wizard, tickets, shift, server room, workbench repair, work computer, Active Directory, reload persistence, autosave), `03-platform` (export and import, co-op conflict, settings on the account, profile, support with internal notes, changelog, backup, registration and maintenance mode, account deletion), `04-layout` (every page at 400 and 1400 px, light and dark, no horizontal scroll, no script errors).
- Browser: system Chrome (`channel: 'chrome'`). Set `PW_CHANNEL=` to use the bundled Chromium.

## Deployment

- `docker compose up -d --build` builds `craftit:1.0.0` and serves on port 9150. Data lives in `./data` (database and `backups/`).
- The entrypoint starts as root only to hand `./data` to the `node` user (bind mounts are often owned by root), then runs the server as `node` via `su-exec`.
- `SIGTERM` closes the HTTP server and the database cleanly.
- Health check: `GET /api/status`.

## Configuration and secrets

- Secrets come from environment variables or a git-ignored `.env` file. Never commit them. See `.env.example`.

| Variable | Default | Meaning |
|----------|---------|---------|
| `PORT` | `9150` | HTTP port |
| `HOST` | `0.0.0.0` | Bind address |
| `DATA_DIR` | `./data` | Database and backups |
| `AI_URL` | empty | Optional OpenAI-compatible endpoint; the admin panel can test it. Empty means templates only |
| `COOKIE_SECURE` | `0` | `1` sets the `Secure` flag on the session cookie (HTTPS behind a proxy) |

## Decisions

| Date | Decision | Reason |
|------|----------|--------|
| 2026-11-26 | Build a clickable single-file mockup before any application code | Agree on screens and flows with the owner before choosing the stack |
| 2026-11-26 | Fictional OS name "WinSec-OS" in all simulated systems | No real product names in the game |
| 2026-11-26 | Version 1.0.0 reuses the mockup code as the frontend; game rules run in the browser, the server stores one JSON state per save game with a revision number | Fastest way to make every mockup feature work; moving rules to the server comes later |
| 2026-11-26 | Built-in `node:sqlite` instead of a native SQLite package | No native build step, works in the Alpine image |
| 2026-11-26 | No external fonts (Google Fonts removed) | No third-party calls (CLAUDE.md) |
| 2026-11-26 | `public/` was generated once from the mockup; from 1.0.0 on, `public/` is the source and the mockup stays as a reference | One place to change the game |
| 2026-11-26 | Support requests and changelog page in the app (modelled on Compain and RP-Management-Board) | Owner request; players reach the admins without leaving the game |
| 2026-11-26 | Password reset only through the admin (temporary password, forced change) | The server sends no e-mail |
| 2026-11-26 | Docker entrypoint with `su-exec` | Bind-mounted data folders owned by root broke the start as `node` |
