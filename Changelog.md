# Changelog

All notable changes to CraftIT are recorded here. Newest first.

## [Unreleased]

### Added

- Operations simulation: the SLA clock of every open ticket runs with the game clock, with a warning 15 minutes before and a notice on breach. SLA times depend on priority (critical 1 h, high 4 h, medium 8 h, low 1 day).
- Shift end now moves the company on: staff recover or get stressed and can call in sick, sick staff return, invoices get paid or become overdue, approved changes are carried out, planned maintenance is done, routines come due again, and service availability reacts to open tickets and overdue routines.
- Month end every 30 days: support contracts are paid in, salaries and the loan rate are paid out; the loan shrinks.
- Service catalogue: create services.
- CMDB: create configuration items; the status follows open tickets of the customer; "Auswirkung prüfen" shows dependent items and affected customers.
- Problem management: record problems, run a 5-why analysis, document a workaround, request a change, and solve the problem. Solved problems stop new tickets of that kind.
- Knowledge base: write articles; "Als Wissensartikel vorschlagen" in the resolve dialog creates a draft that can be reviewed and released.
- Tests: new spec `05-operations` (11 tests) for counters, notifications, SLA clock, overview, finances, staff, routines, month end, ITSM.

### Fixed

- The overview showed a fixed cash value (18.420 €), fixed SLA rate, satisfaction, "Heute" list and team load. All are now calculated from the save game.
- Notifications ("Mitteilungen") were fixed mockup entries with a made-up count. They now list SLA breaches, major incidents, tickets close to their SLA, changes waiting for the CAB, sick or stressed staff, overdue invoices, negative cash, and the next payday.
- Menu counters: the changes counter was fixed at 2. Counters are now badges with spacing (on phones the number stuck to the word), red when a ticket is critical, a major incident or over its SLA, yellow for changes waiting for the CAB, hidden at 0, and readable by screen readers.
- Finances showed fixed monthly income, costs and loan.
- Reports showed fixed satisfaction, SLA rate, workload and resolution times.
- Creating a ticket raised a script error ("n is not defined").
- Ticket, change, invoice and cable numbers could repeat after a few shifts.
- "Bewerber ansehen" did nothing.
- Your own actions were logged as "Derrik" (audit, Active Directory log, mail, chat); they now show your name.
- "Gerade eben" in logs and conversations stayed forever; it is now stored as the game time.

## [1.0.0] - 2026-11-26

Base version: everything from the mockup works as a real application with a server.

### Added

- Accounts: first-run setup creates the server admin, login and logout, registration (open, by invite code, or closed), lock after 5 wrong passwords.
- Save games on the server: up to 5 per player, new-game wizard with difficulty (start money 25.000 €, 18.420 € or 12.000 €), continue, delete, export to a file, import from a file.
- Autosave every 30 seconds, on every page change and when the tab is hidden. The top bar shows when the game was last saved; a click saves at once. A reload continues the open game on the same page.
- Co-op: the owner adds up to 6 members; members can leave. Saving at the same time asks whether to load the newest version or keep your own.
- All game screens from the mockup now play inside a save game: tickets, shift end, ITSM pages, services, access, reports, routines, staff, finances, server room with cabling, workshop with workbench, work computer with mail and calendar, post-mortems, and the Active Directory console.
- Server admin: real users (edit, lock, unlock, temporary password, delete), invite codes, registration and maintenance mode, backups to `data/backups`, AI endpoint test, server log, health figures.
- Settings stored on the account: theme and preferences follow you to every browser; profile, password change, export of all your data, account deletion.
- Hilfe und Support: support requests with category, messages, status and priority; internal notes for admins; unread badge; FAQ.
- Changelog page in the game, with search and a filter by kind of change.
- Tutorial button creates a practice save game "Tutorial".
- Docker image and `docker-compose.yml` (port 9150, data in `./data`).
- Playwright end-to-end tests (22 tests: accounts, gameplay, persistence, co-op, support, admin, layout at phone and desktop width).

### Changed

- The user name and company name in the top bar, menus, greetings and page headers come from the account and the open save game.
- Without an open save game, only save games, new game, settings, support, changelog and (for admins) the server admin page are reachable.
- "Kennwort vergessen" explains that the server admin gives out a temporary password, because the server sends no e-mail.
- Placeholder messages from the mockup are replaced with real messages.

### Security

- Passwords stored as scrypt hashes; HttpOnly session cookie; CSRF header on every change; strict Content Security Policy without third-party sources.
- No external fonts or other third-party requests.

## [Mockup/Concept] - 2026-11-26

Documentation milestone: complete concept for version 1 and a clickable mockup of every screen.

### Added

- Project documentation: README, Concept, Technical, agent notes, Claude Code rules (`CLAUDE.md`, renamed from `claude.md`), and this changelog. `develop` is the main branch.
- Concept v1: IT service desk, company founding, clients and contracts, tickets with investigation, staff, economy, events, and local AI content generation with template fallback (about 100 default tickets).
- Concept: owner answers: real-time play without fixed rounds, single-player and co-op save games, German and English, difficulty per save game, fictional OS "WinSec-OS" over simulated RDP, dark and white mode, player-named companies, an account is always required.
- Concept: ITSM framework based on ITIL 4 (section 6A).
- Concept: accounts and roles (14.2), save games with export and import (14.3), server admin panel (14.4), player settings (14.5), onboarding and help (14.6), data and privacy (14.7).
- Concept: coverage of the full feature list: day cycle and daily simulation, ticket queue with urgency, notes and requests for information (6.2a), users, teams, roles, access requests and audit history (14.8), services and maintenance (14.9), assets, recurring tasks and policies (14.10), reports (14.11), staff workload and automation, milestones and scenarios (10.4), recovery from mistakes.
- Concept: hardware workshop with repair job pipeline, test rig, backup and NAS dependency, quotes with customer decision, parts orders, loaners, stations, and interactive disassembly (6.5).
- Concept: remote session (RDP) with consent, simulated desktop and command set (6.2); phishing and security mail (6.6); post-mortems (6.7); client communication with mood (6.8).
- Concept: server room with several racks and sites, servers, cable types, cabling view and port rules (14.1).
- Concept: work computer with the WinSec-OS desktop and apps (13).
- Concept: detailed Active Directory console (14.1): users and computers, password policy with PSO, groups with AGDLP rules, Group Policy with RSoP, sites and replication with FSMO, DNS, security findings with score and event log, recycle bin.
- Clickable mockup ([mockup/craftit-mockup.html](mockup/craftit-mockup.html)) with all screens: login, save games, new-game wizard, overview with shift end, tickets with triage, notes, chat, investigation and RDP, ITSM screens, post-mortems, services, reports, assets and routines, staff with automation and training, finances, server room with racks and cabling, workshop with job pipeline and detailed workbench, WinSec-OS work computer with Outlook-style mail and calendar, Active Directory, access, settings, and server admin. Light, dark, and system themes.

### Fixed

- Mockup review: unreadable buttons in dark mode, page overflow at phone width, terminal lines, ticket table layout, misplaced parts and screws on the workbench, missing icons in the Active Directory tree.
