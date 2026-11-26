# CraftIT

A browser game about running an IT company. You found a company, sell IT services to clients, and grow. The first module is an IT service desk with ITIL 4 practices, a hardware workshop, a server room, Active Directory, and a simulated work computer. Tickets and dialogues can be written by a local AI model, with an offline template fallback.

## Status

Version 1.0.0 ("base", tag `v1.0.0`): everything from the mockup works as a real application with accounts, save games on the server, co-op, a server admin panel, in-app support requests, and a changelog page. The concept and mockup are tagged `Mockup/Concept`.

## Documents

| File | Purpose |
|------|---------|
| [Concept.md](Concept.md) | What the product does, features, scope, and content rules |
| [Technical.md](Technical.md) | Stack, architecture, data model, deployment, and decisions with dates |
| [agent.md](agent.md) | Current state, open points, and the workflow for coding agents |
| [CLAUDE.md](CLAUDE.md) | Working rules for Claude Code in this repository |
| [Changelog.md](Changelog.md) | Version history |
| [mockup/craftit-mockup.html](mockup/craftit-mockup.html) | Clickable mockup of version 1. Open it in a browser, no server needed. |

## What is in 1.0.0

- **Accounts:** first-run setup creates the server admin. Registration is open, by invite code, or closed. Five wrong passwords lock an account. Admins unlock accounts and hand out temporary passwords.
- **Save games:** up to 5 per player, stored on the server. Autosave every 30 seconds, on every page change, and when the tab is hidden. Export to a file, import from a file. A reload continues the open game.
- **Co-op:** the owner adds up to 6 members. If two people save at the same time, the game asks which version counts.
- **The game:** everything from the mockup (see below), with the game rules running in the browser.
- **Server admin:** users, invites, registration mode, maintenance mode, backups, AI endpoint test, server log.
- **Hilfe und Support:** players open requests (error, question, idea, account). Admins answer, set status and priority, and leave internal notes. Unread answers show a badge. Includes a FAQ.
- **Changelog:** every version from `Changelog.md`, searchable and filtered by kind.
- **Settings** stored on the account: theme, preferences, profile, password, data export, account deletion.

## Getting started

### With Docker (recommended)

```sh
docker compose up -d --build
```

Open http://localhost:9150. The first visit asks you to set up the server and create the admin account. Data is kept in `./data` (database and backups). Optional settings are in `.env.example`.

### Without Docker

Requirements: Node.js 22.13 or newer.

```sh
npm install
npm start          # http://localhost:9150, data in ./data
```

### Tests

```sh
npx playwright install chrome   # only if no Chrome is installed
npm test
```

The tests start their own server on port 9152 with an empty data folder.

## Mockup

Open `mockup/craftit-mockup.html` in a current browser. It covers login, save games, the new-game wizard, overview with shift end, tickets with triage and RDP remote support, ITSM (catalogue, changes with CAB, CMDB, problems, knowledge base, post-mortems), services, reports, assets and routines, staff, finances, server room with racks and cabling, the hardware workshop with a detailed workbench, the WinSec-OS work computer (mail, calendar, shop and more), a full Active Directory console, settings, and the server admin panel. Light, dark, and system themes are supported.

## License

> TODO
