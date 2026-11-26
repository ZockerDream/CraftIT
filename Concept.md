# CraftIT: Concept

Working title. A browser game about running an IT company. The player founds a company and sells IT services to clients. The first module is an **IT service desk**. Later modules add more service types, so the company can grow into a full IT business.

Written for: the owner and coding agents. Version 1 is the service desk. Everything else is planned but must not be built before version 1 works.

The clickable mockup of version 1 is in [mockup/craftit-mockup.html](mockup/craftit-mockup.html). It shows every screen described here and is the visual reference for the build.

---

## 1. Vision

- You start as a one-person IT service provider in a small rented room and grow into a company with staff, offices, and specialised departments.
- Every job is a ticket, a project, or a contract. Clients have problems. You solve them, or you lose the client.
- The core fantasy: "I run a real IT business and I know how the work feels." The game should feel like the job (queues, SLAs, angry customers, late-night outages, good and bad staff) and be fun on top of that.
- Tone: dry, funny, and recognisable for people who have worked in IT. Not a simulator of every detail. Abstract where realism is boring, exact where it creates a good decision.

## 2. Pillars

1. **Decisions with trade-offs.** Every turn asks: take this ticket or wait, hire or train, cheap or safe, fast or thorough.
2. **Readable chaos.** Random incidents happen, but the player always knows why something went wrong and what could have prevented it.
3. **Your company, your style.** Specialise (e.g. only hardware, only security, premium support) or be a generalist. Both must be viable.
4. **Generated but consistent.** Tickets and dialogues are fresh every game. The rules behind them are fixed and fair.

## 3. Core loop (service desk)

1. **Morning:** Check inbox, contracts, staff status, budget, and news.
2. **Assign:** Pick tickets, assign them to staff, or put them in a queue.
3. **Work:** Staff work on tickets over in-game time. Tickets can be solved, escalated, or handed back.
4. **Events:** Something breaks, a client calls, a staff member is sick, a competitor makes an offer.
5. **Evening:** Invoices are paid, SLAs are scored, reputation changes, staff gain or lose XP and stress.
6. **Invest:** Hire, train, upgrade tools, rent a bigger office, sign new contracts, research new services.

**Time model: no fixed rounds.** The game runs in real time, like real work. Tickets arrive when they arrive, clients call when they call, and the world keeps moving while you are away. There is no time limit and no "season" to finish. If you do not play, nothing bad happens beyond what your absence causes (e.g. unanswered tickets, lost clients). Pause and speed settings exist for single-player; in co-op the time runs for everyone together.

**Day cycle and daily simulation.** The company has a shift. The owner can end it with "Start day" or "Next shift" (wording to be settled, see section 16). Ending a shift processes what happened during it:
- finished work is paid and scored against its SLA,
- work that was not finished is carried over, delayed, or lost, with its effect on satisfaction,
- scheduled work (maintenance, changes, shifts, training) runs or is blocked,
- a new, manageable mix of tickets and incidents arrives for the next shift.

The shift summary shows what changed: service health, satisfaction, response-time goals, workload, and cash.

## 4. The company

### 4.1 Founding

- Choose a **company name**, **logo** (simple presets), and **founder**.
- Choose a **starting focus** that gives a small bonus and a small penalty:
  - *Helpdesk generalist:* balanced, no bonus.
  - *Hardware specialist:* faster on device problems, slower on security.
  - *Security boutique:* high trust, expensive, slow to start.
  - *Cheap break-fix:* low prices, low trust, high volume.
- Starting capital is small. The first contracts are the goal.
- **Company name:** the player names their company in game. "CraftIT" is only the name of this project, not of any player's company.
- **Difficulty** is chosen when a save game is created (see section 8.2 and 15).

### 4.2 Company stats

- **Money** (cash, monthly costs, invoices)
- **Reputation** (per client segment: small business, enterprise, private, public sector)
- **Trust** (how much clients believe you can handle sensitive data)
- **Capacity** (how many tickets you can work at once)
- **Brand** (how well the market knows you; grows slowly, decays slowly)
- **Compliance level** (unlocks bigger contracts; needs documentation and audits)

### 4.3 Costs

- Rent (office size), utilities, software licences, insurance, staff salaries, taxes.
- Hidden costs appear when ignored: unpatched systems cause incidents, no backups cause data loss fees.

## 5. Clients and contracts

### 5.1 Client types

| Type | Typical size | Expectations | Pays |
|------|--------------|--------------|------|
| Private person | 1 user | Friendly, slow to pay, often wrong | Little |
| Small business (dentist, bakery) | 5-30 users | Fast help, little budget | Medium |
| Mid-size company | 50-300 users | SLA, reports, documentation | Good |
| Enterprise | 300+ users | Compliance, audits, strict contracts | Very good, hard to win |
| Public sector | varies | Paperwork, slow, very strict | Stable, hard to enter |

### 5.2 Client profile

Each generated client has:
- Name, company, industry, size, location (fictional)
- **Patience** (how long before they escalate)
- **Tech level** (affects how they describe problems, and how often they are wrong about the cause)
- **Budget** and **payment behaviour** (pays on time, late, or disputes invoices)
- **Mood** (changes with response time and quality)
- **Quirks** (e.g. "always blames the printer", "calls on Fridays at 17:55", "never reads emails")

### 5.3 Contracts

- **Pay-per-incident:** one-off tickets, no commitment.
- **Support contract (monthly):** fixed fee, you must answer within the SLA. Breaking it costs money.
- **Managed service:** you take over a whole IT environment (workstations, servers, network). Biggest income, biggest risk.
- **Project:** a set task with a deadline (e.g. migrate 40 mailboxes to a new system).
- **Framework agreement:** only unlocked with reputation and compliance; gives access to public sector work.

Each contract has: price, SLA (response time, resolution time, availability), scope, penalties, and a renewal date. Renewal depends on satisfaction.

## 6. Tickets (the heart of the game)

### 6.1 Ticket anatomy

- **Title and description** (written by the client, in their tone and tech level)
- **Category:** Hardware, Network, Software, Accounts and access, Email, Printing, Cloud, Security, Data recovery, Telephony, Onboarding and offboarding, Other
- **Priority:** Low, Normal, High, Critical (set by client, can be corrected by you)
- **Impact:** how many people are affected (1 person, team, building, company)
- **Urgency:** how soon the requester needs the work done (now, today, this week, when convenient). Impact and urgency together set the priority, as in ITIL 4. The client's wish is shown next to it, and you can correct the priority.
- **Requester:** the client contact who opened the ticket, with their tech level and mood
- **Hidden root cause:** the real problem, revealed only through investigation
- **Symptoms:** what the player can see and ask about
- **Required skills** and **difficulty**
- **Solution steps:** a set of valid actions, with some dead ends
- **SLA clock:** response and resolution timers
- **Value:** payment for a correct, on-time solution

### 6.2 Investigation

The player does not just click "solve". They work the ticket:

- **Ask the client** (questions have useful, misleading, or useless answers depending on the client's tech level)
- **Check the system** (connect via simulated RDP to the client's WinSec-OS machine, with a small command set: `ping`, `check logs`, `restart service`, `view config`, `reset password`, `reinstall driver`, and similar)
- **Remote session (RDP):** the client must agree to the session first. The window shows a simulated WinSec-OS desktop with a command prompt, event viewer, device manager, services, and network tools. Commands and tools show the same clues. A correct fix is found by reading the clues, not by trying every command. Each command takes simulated time, and a wrong command can have side effects. A session that needs hardware work ends with a workshop order (section 6.5).
- **Try a fix** (costs time, may cause side effects)
- **Escalate** (to a specialist; costs a fee, faster for hard tickets)
- **Document** (writing a knowledge-base article makes the next similar ticket faster; costs time now)

The simulated systems are small graphs of components with states. A root cause is one of a fixed set of patterns per category, so the solution is always logically reachable.

**Difficulty** (set per save game) changes the simulation: how many misleading symptoms appear, how often clients give wrong information, how many dead ends a ticket has, and how much time each step takes.

### 6.2a Ticket queue and triage

- **Queue:** every open ticket with requester, category, impact, urgency, priority, description, status, and SLA clock.
- **Sort and filter:** by any column, by category, status, assignee, client, or SLA risk. Filters can be saved.
- **Triage:** pick the right category, impact, and urgency, then route the ticket (assign, queue, or escalate).
- **Notes:** internal notes that the client never sees.
- **Request information:** ask the requester a question. The ticket moves to "Waiting for client" and the SLA clock stops only where the rules allow it.
- **Resolution:** some tickets close in one step. Others need a sequence of investigation and fix actions (6.2). Closing a ticket asks for a short resolution note and sends a satisfaction survey.
- **Results:** every closed ticket changes response-time goals, client satisfaction, and the knowledge base (if documented).

### 6.3 Ticket types (examples)

- "My printer prints only half the page." → Hardware / driver / paper tray / scaling setting
- "I can't log in since this morning." → Accounts / expired password / locked account / MFA device lost
- "The internet is slow." → Network / saturated link / faulty switch / a client running backups at noon
- "Someone sent me a weird invoice PDF." → Security / phishing: quarantine, reset, awareness
- "Our server room is 35 degrees." → Hardware / cooling / fan failure / door left open
- "Our website is down and it's Black Friday." → Critical / hosting / DNS / certificate expired

### 6.4 Special tickets

- **Mass incidents:** one cause, many tickets (e.g. a bad update). Fixing the root cause closes all of them. Working them one by one is slow and expensive.
- **VIP tickets:** from a big client, very high stress, higher value, higher penalty.
- **Hidden trap tickets:** the first answer looks right but makes it worse (e.g. resetting a password that was phished).
- **Hardware repair tickets:** "my laptop won't start" with several possible causes, from a dead battery to a dead mainboard (section 6.5).
- **Directory tickets:** "I can't open the shared drive since the group change" (section 14.1).
- **Server room tickets:** "the server room is hot and a disk is failing" (section 14.1).
- **Customer-caused tickets:** the client broke it, and you must decide whether to bill extra.
- **Ticket fraud:** client asks for an action outside the contract. Accept, refuse, or charge extra.

### 6.5 Hardware repair

Broken devices are a steady source of tickets. The repair workshop turns them into work you can plan and price.

- **Devices:** laptops, desktops, monitors, printers, docking stations, phones, UPS units, switches, client-owned devices.
- **Failure types:** dead SSD, faulty RAM, failing fan, swollen battery, cracked screen, broken keyboard, mainboard fault, PSU failure. Each has a diagnosis path on the bench.
- **Options per device:** repair on site, repair in the workshop, order a replacement part (lead time), send to the vendor under warranty (RMA: cheap but takes days or weeks), replace the whole device (sell the client a new one), or write it off.
- **Decisions:** a mainboard fault on a 6-year-old laptop is usually not worth repairing. The game should show the cost comparison, but the player decides.
- **Data first:** a device with data must be backed up or recovered before any repair or wipe. Skipping this creates a data-loss ticket later.
- **Loaner devices:** lend a client a spare device while theirs is repaired. Costs stock, keeps the client happy.
- **Warranty:** based on device age and purchase date. Out-of-warranty repairs are billed to the client.
- **Workshop upgrades:** a repair bench, anti-static station, device test rack, and a parts cabinet. Each one speeds up a repair type and costs rent or space.
- **Interactive disassembly:** the player opens the device on screen. Screws are removed with the right tool (for example a Phillips screwdriver), the bottom cover comes off, and components are shown in place. Connectors are released with the right tool (for example tweezers). Each step costs time.
- **Mistakes cost quality:** working without an anti-static wrist strap, or removing a part while the battery is still connected, can damage the mainboard. A damaged board ends in a repair quote or a write-off, not a game over.
- **Test before handover:** after reassembly the device is tested. A failed test sends the player back to the bench with the test result as a clue.
- **Job pipeline:** every device is a repair job with stages: intake, data backup, diagnosis, quote, customer approval, repair, and handover with invoice. Skipping a stage has consequences (for example no backup means a possible data-loss ticket).
- **Test rig (Prüfstand):** automated tests for battery, RAM, SSD, display, and radio. Without it, the diagnosis is only a visual check and stays unconfirmed, which costs time when it is wrong.
- **Backup:** backups go to the NAS. If the NAS is down, backups fail until it is fixed in the server room (section 14.1). A backup station makes the workshop independent of the NAS.
- **Quote and decision:** the player shows repair cost (parts, labour at a fixed hourly rate) against replacement price, with a recommendation. The client decides. Options: repair, replacement, vendor warranty (RMA, free, about two weeks, loaner needed), or write-off.
- **Parts and orders:** parts are in stock or must be ordered with a lead time. Deliveries arrive at the start of the day after the lead time. Missing parts block the repair.
- **Loaners:** a limited number of loan devices keeps clients working during long repairs. Loan fee per job.
- **Stations:** test rig, backup station, and parts cabinet. Each one changes how fast and how safely a job runs.

## 6A. ITSM framework (ITIL 4 practices)

The game runs on a full IT service management (ITSM) model based on ITIL 4. Every ticket belongs to a process, and the processes depend on each other. The player learns the real flow: an incident can become a problem, a problem can need a change, a change updates the CMDB, and the knowledge base records the lesson.

### 6A.1 Principles

- **One model, many views.** Every ticket, change, asset, and service lives in one shared data model. Links between them are visible (ticket to configuration item, problem to incident, change to release).
- **Process is a tool, not a tax.** Following the process gives reliable results and better KPIs. Skipping it is faster in the short term and costs more later (process debt, see 6A.5).
- **Realistic roles.** Work is done by roles (analyst, incident manager, problem manager, change manager, CAB member, asset manager, service owner). Staff get roles based on skills and certifications.

### 6A.2 Processes in the game

| Practice | What the player does | Main mechanic |
|----------|----------------------|---------------|
| Service desk (single point of contact) | Takes calls, mails, chats, walk-ins. Triages and routes. | Queue, triage, first-contact resolution |
| Incident management | Restores service as fast as possible. Root cause can come later. | Impact x urgency = priority (P1 to P4). SLA clock. Pause only with a state: "waiting for customer". |
| Major incident management | Handles widespread P1 outages. Assigns an incident manager, runs a time-boxed status update to clients, and writes a post-incident review. | Triggered by broad impact. Skipping the review costs reputation. |
| Service request management | Fulfils standard requests: new laptop, new mailbox, VPN access, software install, folder access. Some need an approval step. | Request catalogue with fixed fulfilment steps |
| Problem management | Finds the cause behind recurring incidents. Records a known error and a workaround, then a permanent fix. | Recurring incidents cluster into a problem. Root cause analysis uses logs and CMDB data. |
| Change management | Plans changes with risk, impact, schedule window, and rollback plan. The Change Advisory Board (CAB) approves normal changes. | Change types: standard (pre-approved, cheap), normal (CAB review), emergency (fast, risky). Change freezes around client deadlines (e.g. month-end at a bakery with a cash system). Failed change creates an incident. |
| Release and deployment | Rolls out patches and software in rings: pilot group first, then everyone. | Ring rollout with a rollback option. Bad release creates mass incidents. |
| Service catalogue | Defines what each service package contains (Basic, Standard, Premium) and what the SLA promises. | Packages sell to clients. Each package has its own SLA and price. |
| Configuration management (CMDB) | Keeps configuration items (CIs): servers, workstations, switches, licences, users, and services, plus relationships ("service X depends on server Y"). | Impact analysis: a failed CI shows every affected service. A wrong CMDB means wrong impact analysis and longer incidents. |
| Asset management | Tracks hardware lifecycle, warranty, licences (count and expiry), and stock. | Licence compliance audits. Links to hardware repair (6.5) and the server room (14.1). |
| Knowledge management | Writes and maintains knowledge base articles. Each article has a quality rating. | Good articles shorten resolution time. Outdated articles lead to wrong fixes. |
| Service level management | Manages SLA (to client), OLA (between internal teams, e.g. network to desktop), and underpinning contracts (to vendors). | Breach gives credit or penalty. Quarterly service review (QSR) with each client. |
| Availability and capacity | Watches uptime targets and capacity (disk, CPU, licence seats) and forecasts when limits will be reached. | Capacity alerts before outages. Upgrades cost money but prevent incidents. |
| Monitoring and event management | Receives alerts from monitoring. Filters noise from real events. | Alert fatigue: too many alerts and staff miss real ones. |
| Service continuity and backup | Runs backup schedules, restore tests, and a disaster recovery plan. | Restore tests show whether a backup really works. Ransomware events test the plan. |
| Information security management | Tracks patch status, MFA coverage, security incidents, and audits. | Links to the security module (14). |
| Supplier and vendor management | Manages vendor contracts, licence prices, RMA processes, and vendor SLAs. | Vendor price changes and bugs appear as market events (11). |
| Financial and service costing | Shows cost and margin per service and per client. | Pricing decisions (9) use these numbers. |
| Workforce and skills | Tracks skills, certifications, and shift rota. Links to staff (7). | Skill gaps cause slow tickets. Certifications unlock contracts. |

### 6A.3 Roles

- **Service desk analyst:** handles first contact and standard incidents.
- **Incident manager:** leads major incidents.
- **Problem manager:** owns the problem records.
- **Change manager:** plans changes and runs the CAB.
- **CAB member:** reviews normal changes. Members can be staff or clients.
- **Asset and licence manager:** owns the asset register and licence compliance.
- **Service owner:** owns one service (e.g. email) and its SLA.
- **Process owner:** owns one practice (e.g. change management) and its KPIs.

A staff member can hold several roles. Too many roles for one person causes stress and mistakes.

### 6A.4 Linked records

Every record can link to others:
- Incident to CI, service, known error, KB article, and (if recurring) problem.
- Problem to incidents, known error, and change.
- Change to CIs, release, incidents it caused or fixed, and a rollback plan.
- Request to catalogue item, approval, and asset.
- CI to service, owner, and warranty or licence.

Links make the impact of a single decision visible. A change on a shared server affects every linked service.

### 6A.5 Process KPIs and maturity

Each practice has KPIs that the game shows on the process dashboard:
- Incidents: mean time to restore (MTTR), first-contact resolution, SLA met, reopened tickets
- Problems: recurring incident rate, known errors documented
- Changes: change success rate, emergency change share, failed changes causing incidents
- CMDB: accuracy (share of CIs that match reality), missing relationships
- Knowledge: article use rate, outdated article rate
- Assets and licences: compliance rate, warranty expiries missed

**Maturity levels (1 to 4)** per practice. Level rises with consistent use of the process over time. Higher levels unlock larger contracts, better tools, and lower incident rates. Higher levels also need more staff time per ticket.

**Process debt:** skipping a process (no change record, no CAB, no post-incident review) gives short-term gain and adds hidden risk. The risk shows up later as mass incidents, failed audits, or lost clients. The game shows the debt as a visible counter, not as a punishment.

**Audits:** clients or certifications (ISO/IEC 20000 style) audit the processes. A pass gives reputation and access to bigger contracts. A failed audit costs money and time to fix.

### 6A.6 Player views

The ITSM hub in the game has these views: service desk queue, incidents, major incident room, requests and catalogue, problems, changes with a CAB calendar, CMDB explorer, asset and licence register, knowledge base, SLA and OLA dashboard, process KPIs, and reports for clients.

### 6A.7 Scope split

- **Version 1 (core ITSM):** service desk, incidents, major incidents, service requests and catalogue, problems, changes (standard and normal, CAB), basic CMDB with impact analysis, assets and licences, knowledge base, SLA and OLA, process KPIs and maturity, process debt.
- **Later modules:** full release pipeline with rings, deep availability and capacity management, detailed supplier management, detailed financial costing, detailed continuity and disaster recovery, advanced monitoring and event management.

## 7. Staff

### 7.1 Employees

Each person has:
- **Name, age, background** (generated)
- **Skills:** Hardware, Networking, Windows, Linux, Cloud, Security, Email, Customer talk, Documentation, Project management, Sales (levels 0-10)
- **Traits:** e.g. Fast but sloppy, Careful but slow, Great with customers but nervous, Knows everything about printers, Burnout risk
- **Energy and stress:** affects speed and error rate; too much stress causes sick days or quitting
- **Salary and mood**
- **XP and level**
- **Workload:** assigned open work against available capacity (skill fit, energy, stress). Overload raises error rate and stress.

### 7.2 Staff actions

- Hire (from candidates with varying quality and salary)
- Train (courses take time and money; certifications unlock contracts)
- Assign to tickets, queues, or shifts
- Give time off
- Promote, give bonuses, or fire (fire = severance and reputation risk)
- **Automate:** once a routine task is well documented, the owner can automate it (for example password resets or certificate renewal). Automation costs budget and setup time, saves staff capacity, and can fail. A failed automation creates an incident, and the rule can be rolled back.

### 7.3 Staff events

- Sick day, conflict between two staff members, a good idea from an intern, a burnout warning, a poaching offer from a competitor, a personal emergency.
- Some events come with a short **dialogue** (generated by the local AI, see section 12).

## 8. Equipment, software, and office

### 8.1 Office

- Start: a room with two desks and one bad coffee machine.
- Upgrades: bigger room, server room, meeting room, call centre, locked cabinets, better chairs (stress reduction).
- Location affects costs and which clients will visit.

### 8.2 Tools and software

- **Ticketing system:** the basic one is slow and clumsy. Better ones are faster and show SLA warnings earlier. Upgrading is a real choice.
- **Remote management tool:** enables remote sessions (RDP) into the client's machine. Without it, every hardware ticket needs a site visit.
- **Fictional operating system: "WinSec-OS".** All client machines in the game run WinSec-OS. This name is fixed. Real Windows, macOS, and Linux brands do not appear in the game.
- **Monitoring:** early warning for outages (reduces mass incidents).
- **Backup system:** protects against data-loss penalties. Needs regular tests.
- **Password manager, MFA, endpoint protection:** reduce security incidents.
- **Knowledge base:** speeds up known issues.
- **Licences:** cost monthly; running out of licences causes problems.

### 8.3 Hardware stock

- Spare parts (SSD, RAM, printer toner, network cable, UPS). Running out makes hardware tickets slow.
- Warehouse with a limit; ordering takes time.

## 9. Economy

- **Income:** invoices from tickets and contracts; bonuses for fast, high-quality work; project milestones.
- **Costs:** salaries, rent, licences, parts, training, travel (site visits), penalties, insurance.
- **Cash flow:** invoices are paid with a delay. A company with much work and no cash can still go bankrupt. This is a core mechanic.
- **Pricing:** the player sets a price multiplier per client segment. Too cheap = low margin. Too expensive = lost clients.
- **Loans:** a bank loan gives early growth with interest and a credit score.
- **Taxes:** a flat rate on profit at year end.
- **Bankruptcy:** possible but not instant. You get warnings. Restart is possible with a new company (keeps a small legacy bonus).

## 10. Progression and unlocks

### 10.1 Reputation tiers

Tiers unlock client types and contract types: Garage (private), Local (small business), Regional (mid-size), National (enterprise), Certified (public sector).

### 10.2 Certifications

Staff and the company can earn certifications (e.g. "Network Basics", "Cloud Admin", "Security Baseline", "Data Protection"). Some contracts require them.

### 10.3 Research

A tech tree of services and tools. Examples:
- Better ticketing and remote management (early)
- Managed services and monitoring (mid)
- Security operations, incident response, compliance (mid-late)
- Cloud and hosting (late)

### 10.4 Milestones and scenarios

- **Start:** a small office with limited tools, a few clients, and one or two staff.
- **Milestones:** onboarding a department, reaching a reputation tier, handling a simulated outage, or passing a certification unlock more systems (for example monitoring, a second rack, a service catalogue) and more scenario types (for example a site outage, a ransomware attack, a planned office move).
- **Scenarios:** a scenario is a bounded set of linked tickets, incidents, and changes with a goal. Scenarios can be replayed with different difficulty.

## 11. Random events and market

- **Incidents:** power cut, ransomware, DNS outage, expired certificate, lost laptop, office flood, a bad update from a vendor.
- **Market:** demand per industry rises and falls. Competitors appear, undercut prices, poach clients, or go bankrupt.
- **Vendor news:** a vendor raises licence prices, a new tool appears, a known bug is announced.
- **Regulation:** a new data protection law makes compliance work more valuable and wrong handling more expensive.
- **Seasons:** tax deadlines, Black Friday for shops, holiday season (fewer staff, more emergencies).
- **Good luck events:** a happy client refers a friend, a lucky audit, a grant.

Events are weighted by company state. A company with no backups is more likely to get ransomware. That is a teaching moment, not a punishment.

## 12. AI-generated content (local model)

The game can use a **local language model** (optional; same approach as Compain: llama.cpp in a Docker container, OpenAI-compatible API). Templates are the default. The model generates:

- **Ticket texts:** the client's message, in their voice and tech level, for a given category and symptom set.
- **Client profiles:** names, company names, quirks.
- **Dialogues:** calls and emails during investigation, staff conversations, event texts.
- **News and market headlines.**

### 12.1 Rules

- **The AI writes text, never rules.** Priorities, prices, root causes, SLAs, outcomes, and probabilities come from the game's own tables. The model cannot change them.
- **Structured output.** The model returns JSON with a fixed schema. Invalid or incomplete output is rejected and regenerated, then falls back to templates.
- **Fallback always works.** If the model is off, slow, or unavailable, the game uses the template generator (same schema, same content slots). The game must be fully playable without the AI.
- **Default content.** The game ships with about **100 default tickets** (written by hand, with template variants). These are always available, so the game works fully without AI.
- **Pregeneration.** When AI is on, tickets and dialogues are generated in batches in the background, ahead of time, so the player never waits.
- **Content filter.** Output is checked for forbidden content and for real people or organisations (rule set in the owner's own list). Failed items are dropped.
- **No real names.** Fictional people and companies only. Generated company names are checked against a blocklist of real brands.
- **Language.** Game language (German or English) is chosen in the user's settings. The model is asked for the same language. Templates exist in both languages.

### 12.2 Quality

- Tone and consistency: each client keeps the same voice across tickets.
- Repetition check: avoid the same opening sentence too often.
- Tech accuracy check: the text must match the ticket's category and symptoms, e.g. a printer ticket must not mention a database.

### 12.3 Hardware

- Same options as Compain: CPU by default, optional NVIDIA GPU. The game must run without GPU.
- Model choice is configured in settings; start with a small instruction-tuned model and measure speed and quality before choosing.

## 13. Player interface

- **Overview dashboard:** open and urgent tickets, service health, team workload, budget, in-game time, and recent activity. The "Start day" or "Next shift" action sits here.
- **Main screen:** office view (simple illustration), inbox, staff list, today's schedule.
- **Ticket board:** kanban-like columns (New, Assigned, In progress, Waiting for client, Escalated, Done).
- **Ticket view:** description, chat/mail with the client, remote session terminal, notes, time tracker.
- **Finance:** cash, invoices, costs, forecast.
- **Staff:** cards with skills, mood, and history.
- **Market:** competitors, client leads, news.
- **Knowledge base:** articles the company has written.
- **Users and access:** employee accounts, teams, roles, access requests, and the audit history (section 14.8).
- **Services:** service health, capacity, alerts, and maintenance (section 14.9).
- **Assets and routines:** devices, recurring tasks, and policies (section 14.10).
- **Reports:** the feedback and reports view (section 14.11).
- **Desktop (WinSec-OS):** the work computer uses the fictional WinSec-OS desktop: a wallpaper, desktop icons (double-click to open), windows that can be moved, resized, minimised, maximised and closed, a taskbar with the open windows, a start menu, a context menu, and a clock that shows the game time. The same desktop is used for the remote session (RDP) later.
- **Work computer (Arbeitsrechner):** the player's own desktop, with apps: Shop (parts, tools, licences, paid from cash), Mails (client requests, with links to tickets and a reply), Messages (team and warehouse channels), Benchmark (checks a device's CPU, RAM, and disk), Browser (supplier search with delivery times), Calendar, Files (contracts, invoices, guides), Notes (kept in the browser only), Passwords (masked by default), and Monitoring (service status). Parts bought here appear in the workshop stock. An anti-static wrist strap must be bought before a device is opened.
- **Settings:** language, speed, AI on/off, AI model, sound, accessibility options.

Design: clean UI with a **dark mode and a white mode**, desktop first. Works at phone width for reading only (no requirement to play on a phone in version 1). The visual base is the front end of **RP-Management-Board** (`apps/web/public/css/theme-v3.css`, which already has dark and light token sets), used as inspiration for layout and colours.

## 14. Modules (roadmap)

Version 1 is the **IT service desk**. Later modules are planned only:

| Module | Adds |
|--------|------|
| Service desk (v1) | Tickets, staff, contracts, office, economy, events, AI text, hardware repair, Active Directory, server room and cabinets, ITSM core (section 6A) |
| Network operations | Monitoring, outages, switches, VPN, site-to-site links |
| Security operations | Incidents, phishing campaigns, audits, compliance |
| Systems and cloud | Servers, virtualisation, hosting, cloud migrations |
| Projects and consulting | Long projects with milestones, consultants, bids |
| Software development | Build and maintain apps for clients (bug queue, releases) |
| Sales and marketing | Lead generation, pitches, pricing strategy |

Each module reuses the same core: clients, contracts, staff, economy, events. New modules add ticket types and mechanics, not a new engine.

## 14.1 Feature details (all in version 1)

### Active Directory (Identity module)

- **Model:** a domain with forests, OUs, users, groups, computers, and Group Policy Objects (GPOs). Users and computers sit in OUs. GPOs apply settings to OUs.
- **Typical tickets:** password reset, locked account, wrong group membership, GPO not applying, computer not joining the domain, stale computer account, time skew breaking Kerberos login, replication problems between domain controllers, DNS problems for the domain.
- **Onboarding and offboarding:** new hire gets a user, groups, and a computer account. Leaver must be disabled, not deleted, and their groups reviewed. Forgetting this is a classic security ticket.
- **Admin tiers:** privileged groups (e.g. Domain Admins) must stay small. Finding a regular user in a privileged group is an audit finding with a penalty.
- **Risk:** a wrong change to a group or GPO can break many users at once. Such a change is a mass incident. Testing in a staging OU is a valid, slower option.
- **Version 1:** full AD model as described above (OUs, groups, GPOs, admin tiers, replication problems, audit findings).
- **Console (version 1):** one Active Directory console with seven areas.
  - *Users and computers:* OU tree, object list, and property sheets with tabs (General, Account, Member of, Organisation, Profile, Attribute editor with distinguishedName, objectSid, userAccountControl and other attributes). Actions: reset password, unlock, enable or disable, move, add to group, delete. New user, group, OU and computer, with templates that copy group memberships.
  - *Password policy:* every reset and every new account is checked against the effective policy. The Default Domain Policy applies to everyone, and a fine-grained policy (PSO) with stricter rules applies to Domain Admins.
  - *Groups:* scope (domain local, global, universal) and type (security, distribution). Nested memberships are resolved. AGDLP is enforced: a global group cannot contain a domain local group, scope changes between global and domain local go through universal, and loops are refused.
  - *Group Policy:* GPOs with links, enforced and disabled links, and a status. Resultant Set of Policy for a chosen user shows the applied GPOs in order and the winning setting for each value.
  - *Sites and replication:* sites, subnets, site links, domain controllers, replication status per partition, and the five FSMO roles. A role transfer is refused while replication is broken.
  - *DNS:* the AD-integrated zone with A, CNAME and SRV records, editing with validation, scavenging of stale records, and a name lookup tool. A wrong A record for a domain controller breaks replication (error 8524) until it is fixed.
  - *Security and audit:* findings are computed from the data (privileged group members, old krbtgt password, service accounts with an SPN and a never-expiring password, stale users and computers, unlinked GPOs, broken replication, admin accounts outside Protected Users). They feed a security score from 0 to 100, and each finding has a fix. A security log uses real event IDs (4624, 4625, 4720, 4724, 4728, 4740 and others).
  - *Recycle bin:* deleted objects can be restored with their attributes and group memberships for 180 days.
- **Links to other systems:** approving an access request for a role adds the account to the matching AD group. A missing account must be created first.

### Server room and cabinets (Systems module)

- **Racks:** cabinets have units (U). Servers, switches, patch panels, UPS units, and PDUs take units. Placement is a drag-and-drop view. A device needs free consecutive units; the placement check refuses overlaps.
- **Multiple racks and sites:** a company can run several racks at several locations (for example the main server room, a warehouse, and a rented off-site data centre). Each rack has its own units, power budget, and cooling. Rack-to-rack links (fibre, WAN) count as cables between sites.
- **Servers:** a server has a role (Active Directory, file, web, backup, scanner, replication), an operating system, a load value, and a number of network ports. Servers can be added to a free slot in any rack.
- **Cable types:** LAN (copper), fibre (LWL), power, WAN, and KVM. Each type has its own colour in the cabling view.
- **Cabling view:** a topology plan shows all racks, devices, and cables. Selecting a device or cable highlights its connections. The cable list shows source and target port, type, length, and status (in order, untested, or faulty).
- **Port rules:** one cable per port. A cable connects two different devices. Each new cable is marked "untested" until someone checks it. A faulty cable causes incidents on the devices it connects.
- **Power and cooling:** each device draws power and produces heat. The rack has a power budget and a cooling limit. Overloading causes outages and overheating events, which fit the "server room is 35 degrees" ticket type.
- **UPS:** protects against power cuts. Battery runtime depends on load. A dead battery is a hidden risk until the next outage.
- **Cabling:** patch cables and labels. Wrong or unlabelled cabling makes every future ticket slower.
- **Capacity planning:** adding a server needs free units, power, and cooling. Not enough space means a bigger rack, a second cabinet, or a rented data centre slot (monthly cost).
- **Lifecycle:** devices have age, warranty, and failure rate. Planned replacement is cheaper than emergency replacement.
- **Physical access:** locked cabinets, key holders, visitor log. Missing access control is a security finding.
- **Typical tickets:** RAID disk failure, server beeping at night, cooling failure, power cut with a dead UPS, replacing a switch with a spare, moving a rack.

## 14.2 Accounts and access

- **Always required:** every player needs an account, for single-player and co-op games alike. There is no guest mode.

- **Registration:** username, password, and optional email. The server admin chooses the mode: open, invite only, or closed. Passwords are stored as Argon2 hashes.
- **Email (optional):** used for password reset and notifications. Without an email server configured, only the admin can reset a password.
- **Login and sessions:** login with rate limiting on failed attempts. Sessions expire after inactivity. "Log out everywhere" ends all sessions. Admins can enable two-factor login (TOTP) for their own account.
- **Profile:** display name, avatar (preset images), language, theme, and notification settings.
- **Roles:**
  - *Player:* creates and plays save games, joins co-op games by invite.
  - *Co-op member roles inside a save game:* Owner (full control), Manager (staff, contracts, finance), Staff (works tickets only). Roles apply inside one save game, not server-wide.
  - *Server admin:* full access to the server management panel (section 14.4). A server has at least one admin. The last admin cannot be removed.
- **Limits:** the admin sets the maximum number of save games per player and the maximum members per co-op game.
- **Account deletion:** the player can export their data first, then delete the account. Co-op games they own are handed to another member or closed with a notice to members.

## 14.3 Save games

- **One save game = one company.** A player can have several save games. Single-player and co-op save games are listed separately. A player can have single-player and co-op save games at the same time.
- **Create:** choose type (single-player or co-op), company name, founder name, starting focus (6.3 and 4.1), and difficulty. The difficulty is fixed after creation. Options: easy, normal, hard. Difficulty changes the simulation (section 6.2), not the rules.
- **Time model:** a company runs in real time, but game time only advances while a player is active in that save game. Tickets arrive when the player is online. Nothing advances while the player is away. This matches the rule that the game does not punish absence (section 3).
- **Save and load:** autosave at a set interval (default 5 real minutes while active), manual save, and load of a named save point. Save points keep the last 10 autosaves per game.
- **Manage:** rename, duplicate (new save from a copy), archive (kept but hidden), delete (with confirmation and a warning that the data is gone).
- **Export and import:** a save game exports to one file (JSON). Import creates a new save game. The export can be encrypted with a password. Importing into the same server as a co-op game is not allowed; a single-player export can be turned into a new co-op game.
- **Co-op games:**
  - The owner invites players by username. Invites expire after 7 days.
  - Game time runs when at least one member is active.
  - Actions go through the server. The server applies them in order, so two members cannot both assign the same ticket.
  - Chat and notes are shared inside the game. There is one shared ticket inbox.
  - A member can leave. The owner can remove a member. Leaving does not delete their staff; staff stay with the company and are reassigned by a manager.
- **Save integrity:** each save has a version number and an event log. Game updates include a migration step for old saves. A save that cannot be migrated is kept read-only, and the admin is told.

## 14.4 Server management (admin panel)

The admin panel is part of the game server. It is only visible to server admins.

- **First-run setup:** create the admin account, name the server, set the language, choose the registration mode, and optionally connect the AI endpoint and an email server.
- **Users:** list, create, disable, reset password, change role, set per-player limits, see the save games each player has, and delete accounts (with the same export-first rule).
- **Save games overview:** all save games with owner, members, size, last activity, and version. The admin can archive or export a save game for a player on request, but cannot read ticket contents by default. Admins see metadata only.
- **Content:**
  - the ~100 default tickets: edit, enable, disable, and add new ones
  - templates for customer messages and staff dialogues in German and English
  - client and company name lists, and the blocklist of real brands and real people
  - the content filter rules
  - content packs: import and export as files
- **AI (optional):**
  - endpoint URL (OpenAI-compatible), model name, test connection button
  - pregeneration on or off, batch size, timeout, and retry count
  - status of the local model container (like the Compain model page: install, speed test, current model)
  - the game works with AI off. The admin can see how often the template fallback is used.
- **Server settings:** server name, public URL, port, registration mode, maximum users, maximum co-op members, default autosave interval, rate limits, and a maintenance banner that tells players when a restart is coming.
- **Backups:** scheduled database backup, retention period, optional encryption key, manual backup, restore from a backup, and a test restore on a copy.
- **Logs and audit:** application log, error log, and an audit log of admin actions and logins. No telemetry leaves the server.
- **Health:** database status, AI status, disk space, and last backup time on one page.
- **Updates:** installed version, changelog, and the update steps. The server does not check for updates over the internet unless the admin turns that on.
- **Security:** admin IP allowlist (optional), session timeout, password rules, two-factor login for admins, and a lock option for the whole server (only admins can log in).
- **Feedback inbox:** bug reports and ideas sent from inside the game.

## 14.5 Player settings

- **Language:** German or English. Changes take effect at once.
- **Theme:** dark, white, or the system setting.
- **Game speed:** pause, normal, and fast, for the player's own single-player games. Co-op games use the normal speed set by the owner.
- **AI:** on or off for the player, only if the server has AI enabled.
- **Sound:** on or off, with a volume setting.
- **Notifications:** which events show in the game and which are sent by email (only if email is set up).
- **Accessibility:** text size, reduced motion, a colour-blind-safe colour set for priorities and status, and keyboard shortcuts.
- **Data:** export all my data, and delete my account (section 14.2).

## 14.6 Onboarding, help, and feedback

- **Tutorial:** a short scripted save game that teaches the first ticket, the remote terminal, the knowledge base, and the first staff assignment. It does not count toward achievements or statistics.
- **Glossary:** each ITSM term used in the game (incident, change, CMDB, SLA, and others) has a short explanation in the game, in German and English.
- **Tooltips:** hovering over a status, priority, or KPI explains what it means and how to change it.
- **Changelog:** the game shows the server's changelog, so players see what changed after an update.
- **Feedback:** a bug or idea form, with the save game id and the game version attached. Only the admin sees it.
- **Recovery:** mistakes have clear consequences and a way back. A wrong fix can be rolled back from the last save point, a client can get a credit, or a ticket can be reopened and handed to a specialist. A bad decision never ends a save game on its own. The tutorial introduces one system at a time and explains why each action matters.

## 14.7 Data, backup, and privacy

- All data stays on the server that runs the game. The game makes no calls to third parties, except the optional AI endpoint and the optional email server.
- No tracking, no analytics, no advertising, and no cookies beyond the login session.
- Players can export all their data and delete their account.
- The server admin is responsible for the imprint and privacy notice. The game shows them from a settings file, so each server can have its own.

## 14.8 Users, teams, and access (in-game)

This is the company's own identity and access work, in the game. It is separate from player accounts (14.2).

- **Employee accounts:** fictional employees and client users. Enable, disable, reset, and unlock them, each action simplified.
- **Teams and roles:** group staff into teams and grant roles (for example Helpdesk, Admin, Manager). Roles give access to systems.
- **Access requests:** clients and staff ask for access. Approve or refuse, check against policy, then grant. Wrong approvals create a security finding.
- **Audit history:** every change (who, what, when, and which ticket) is recorded and can be read per account.
- **Links:** the Active Directory module (14.1) is the simulated backend. Every account and role change in the game is visible there.

### 6.6 Security mail and phishing

- Some mails in the inbox are phishing: a look-alike sender address, urgent wording, and a link. The player checks the address and the link before acting.
- Reporting a phishing mail earns points. Reporting a genuine mail costs points. Opening a phishing link opens a security incident ticket and costs more points.
- Phishing gets harder with difficulty and with company stats (more staff, more clients, more exposure).

### 6.7 Post-mortems

- After a major incident is resolved, the game creates a post-mortem: timeline from the ticket, the cause (chosen from a list), up to three measures, and a short written report.
- The score rewards the right cause and sensible measures (testing, alarms, backups). Measures that do not address the cause cost points.
- The result explains the real cause and which measures would have helped. Post-mortems feed the problem management record (section 6A).

### 6.8 Client communication

- Every client message is answered by the client. The client's mood (satisfied, unsure, angry) changes with the tone and clarity of the player's messages.
- Replies are written by the local AI when AI is on, and from templates when it is off. Game rules decide the mood, not the AI.
- Mood at the end of a ticket shapes the satisfaction score.

## 14.9 Services and infrastructure

- **Services:** fictional services the company runs or supports (mail, file share, print, VPN, line-of-business app). Each has availability, capacity, and a warning state, shown in plain words and colours that work for colour-blind players (14.5).
- **Alerts:** a service that drops below its threshold raises an alert. Investigate it like an incident, with the same investigation steps as tickets.
- **Maintenance:** schedule maintenance windows. Maintenance runs as a change (section 6A), so it needs a window and can be refused by the CAB.
- **Upgrade and restore:** choose when to upgrade capacity (costs money and time) or restore a service from backup (costs time and risks data loss).
- **No real commands:** the game shows the effects only. Server commands in the remote terminal stay simulated (section 6.2).

## 14.10 Assets, routines, and policies

- **Assets:** devices, licences, and resources, linked to clients and to the CMDB (section 6A).
- **Recurring tasks:** routine work (patch day, backup check, licence review, printer cleaning). A task done on time lowers the chance of repeat incidents on that asset. A task that is skipped raises it.
- **Policies:** rules that the company follows (password rules, update window, access review). Policies affect incidents and access requests. A policy can be changed through a change.
- **Operational resources:** spare parts, licences, and rented capacity. Running out blocks work and shows as a warning on the overview.

## 14.11 Reports and feedback in the game

- **Service health:** availability and capacity per service over time.
- **Client satisfaction:** survey results per client and per ticket type, with the reason where it is known.
- **Response-time goals:** how often SLAs were met, per priority and per team.
- **Workload:** open work, overload, and sick days per person and per team.
- **Activity history:** a timeline of tickets, changes, alerts, and staff events, filterable.
- **Explanations:** each report says which decision caused the change, for example "Maintenance was skipped on Tuesday, so the printer failed three times this week."

## 15. Scope for version 1

**In:**
- Founding and company stats
- Client types and contracts (pay-per-incident, support contract)
- Ticket system with investigation, remote terminal, escalation, knowledge base
- Staff hiring, training, stress and energy, sick days
- Basic office and tool upgrades
- Hardware repair workshop (diagnosis, repair, parts, RMA, loaner devices, write-off) (section 6.5)
- ITSM core (section 6A): service desk, incident and major incident management, service requests and catalogue, problem, change with CAB, basic CMDB with impact analysis, assets and licences, knowledge base, SLA and OLA, process KPIs, maturity and process debt
- Active Directory: users, groups, OUs, GPOs, onboarding and offboarding, admin tiers, replication and DNS tickets (section 14.1)
- Server room and cabinets: racks, rack units, power and cooling, UPS, cabling, lifecycle, physical access (section 14.1)
- Economy with cash flow and bankruptcy
- Random events and market (basic)
- Local AI text generation (optional) with template fallback and about 100 default tickets
- Single-player and co-op. Each save game is either single-player or co-op. Co-op save games are separate from single-player ones.
- A user can have single-player and co-op save games at the same time.
- Save games: name the company, choose difficulty, autosave, export and import (section 14.3)
- Accounts: registration with mode set by admin, login, profile, roles, account deletion (section 14.2)
- Server admin panel: first-run setup, users, save games overview, content, AI settings, backups, logs, health, updates, security, feedback inbox (section 14.4)
- Onboarding tutorial, glossary, tooltips, changelog in game, feedback form (section 14.6)
- Data export and account deletion (sections 14.5 and 14.7)
- Settings per user: language (German or English), dark or white mode, game speed, AI on/off
- Real-time play with no fixed rounds
- Day cycle with "Start day" or "Next shift" and the daily simulation (section 3, wording to be confirmed in section 16)
- Ticket queue with sort, filter, urgency, requester, notes, request for information (section 6.2a)
- Users, teams, roles, access requests, and audit history (section 14.8)
- Services with availability, capacity, alerts, maintenance, and upgrade or restore (section 14.9)
- Assets, recurring tasks, and policies (section 14.10)
- Staff workload and automation of routine tasks (section 7)
- Milestones and scenarios for progression (section 10.4)
- Reports and explanations of decisions (section 14.11)
- Tutorial and recovery from mistakes (sections 14.6 and 14.11)

**Out (later):**
- Leaderboards and shared market between different companies (open point, see section 16)
- Other modules from section 14
- Mobile play
- Mods and scripting
- Real-world integrations (no internet calls except the optional AI endpoint)

## 16. Open questions

### New, to confirm by the owner

- Day cycle: section 3 says time runs in real time with no fixed rounds, but "Start day" or "Next shift" ends a shift on demand. Which is right? Option A: real time, and the shift summary is a report that can be opened at any time. Option B: the owner closes each shift, and time stops between shifts. Option C: both, depending on the save game. Also: section 3 says the world keeps moving while you are away, and section 14.3 says game time advances only while you are active. These two statements conflict and need one answer.
- Automation: is it in version 1, or in a later milestone (section 10.4)?
- Until the owner decides, the mockup and version 1.0.0 use this behaviour: the game clock runs while a player has the save game open, and "Schicht beenden" closes the shift on demand (a mix of options A and B). Automation is included in version 1.

- Game time advances only while a player is active (section 14.3).
- An account is always required, for single-player and co-op. There is no guest mode (confirmed by the owner).
- Default save game limit per player: 5. Default maximum co-op members: 6.
- Email is optional.
- Difficulty cannot be changed after a save game is created.

### Earlier questions


1. Single player only, or should other players be able to compete in a shared market later?
   - **Answered:** Single-player and co-op both work. Co-op and single-player save games are separate. A user can have a single-player save and a co-op save at the same time.

2. How long should a full game run?
   - **Answered:** No fixed length. The game is permanent and runs in real time. Tickets come in like real-life work. If you do not play, the game does not end.

3. Which languages in version 1?
   - **Answered:** German and English, set in the user's settings.

4. How hard should the simulated systems be?
   - **Answered:** Difficulty is set when creating a save game. Client machines are reached via simulated RDP. They run the fictional OS "WinSec-OS" (fixed name). No Windows or macOS.

5. Art style: illustrated, pixel, or clean UI only?
   - **Answered:** Clean, modern UI with dark and white mode. RP-Management-Board is the inspiration for the front end.

6. Should the AI be required, or only optional with templates as the default?
   - **Answered:** Optional. Templates are the default. The game ships with about 100 default tickets.

7. Name: keep "CraftIT" or pick a final name?
   - **Answered:** "CraftIT" is the project name. Each player names their own company in game.