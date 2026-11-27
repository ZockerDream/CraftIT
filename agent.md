# CraftIT: Agent notes

Working state for coding agents. Keep it short and current. **If a session ends mid-task, the next agent continues from "Work in progress" below.**

## Current state

- Version **1.0.0 ("base")** is released (tag `v1.0.0`). Everything from the mockup works as an application: accounts, save games on the server with autosave, co-op, server admin, support requests, changelog page. See [README.md](README.md) and [Technical.md](Technical.md).
- [Concept.md](Concept.md) is complete for version 1. Tag `Mockup/Concept` marks the finished concept and mockup.
- The mockup in [mockup/craftit-mockup.html](mockup/craftit-mockup.html) is a reference only. **The source of the game is `public/`** (`index.html`, `css/app.css`, `js/app.js`) and `server/`.
- Main branch: `develop`. Local instance: `docker compose up -d --build`, port 9150.

## Work in progress

Nothing in progress. Since 1.0.0 (unreleased, on `develop`): operations simulation, live overview, notifications and finances, ITSM pages with real data, staff assignment by skill and a training system, the team taking and solving tickets with live progress, notifications with read state. Candidate for release 1.1.0. Next candidates (ask the owner before starting):
- Move game rules from the browser to the server (Technical.md, decision of 2026-11-26).
- English UI texts.
- A fresh scenario per new game instead of the same Nordlicht world.

## Open points

- Time model (Concept.md section 16): implemented as in the mockup (the clock runs while a save game is open, plus "Schicht beenden"). The owner has not confirmed this yet.
- Game rules run in the browser in 1.0.0; the server stores the state. A player can change their own state with the browser tools. Fine for single-player; matters for co-op fairness later.
- English UI text: setting exists, texts are German only.
- The default scenario world (Nordlicht, characters such as Derrik Winchester in AD, mails and chat) is the same for every new game in 1.0.0. The player's own name and company name are used in the top bar, headers and greeting.
- No e-mail: password reset goes through the admin (temporary password).

## Code map

- `public/js/app.js`: one script in an IIFE. Mockup game code first, then the platform part (search for `Plattform: Server, Konten`): `api()`, `captureState()` / `applyState()` (add new game globals to both), autosave, auth modes, `platformGuard()` (route access), save list, account dialogs, admin, then changelog and support, then `boot()`.
- `server/`: `index.js`, `db.js` (schema; add migrations here), `auth.js`, `api.js`, `support.js`.
- `tests/`: Playwright specs run in order on a fresh server (`tests/serve.js`, port 9152).

## Workflow

- Read [README.md](README.md), [Concept.md](Concept.md), and [Technical.md](Technical.md) before changing code.
- Keep changes small. Run `npm test` before reporting success; all tests must pass.
- When adding game state, extend `captureState()` and `applyState()` and add a check to the reload test in `tests/02-game.spec.js`. Give older save games a default in `opsSync()` or in `applyState()`.
- Never put fixed numbers into the HTML for things the game changes; render them from the state.
- Add a [Changelog.md](Changelog.md) entry for every user-visible change. The in-game changelog page reads this file.
- Update this file when the state or the open points change.

## How to release

1. Move the entries under `[Unreleased]` in [Changelog.md](Changelog.md) to a new section with the version and date.
2. Update the version in `package.json` (and the image tag in `docker-compose.yml`).
3. Run `npm test`.
4. Commit on `develop` with a message that names the version.
5. Create an annotated tag `vX.Y.Z` (or a named tag such as `Mockup/Concept` for documentation milestones) and push the branch and the tag.
