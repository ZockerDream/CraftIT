# Changelog

All notable changes to CraftIT are recorded here. Newest first.

## [Unreleased]

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
