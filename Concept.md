# CraftIT: Concept

Working title. A browser game about running an IT company. The player founds a company and sells IT services to clients. The first module is an **IT service desk**. Later modules add more service types, so the company can grow into a full IT business.

Written for: the owner and coding agents. Version 1 is the service desk. Everything else is planned but must not be built before version 1 works.

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
- **Try a fix** (costs time, may cause side effects)
- **Escalate** (to a specialist; costs a fee, faster for hard tickets)
- **Document** (writing a knowledge-base article makes the next similar ticket faster; costs time now)

The simulated systems are small graphs of components with states. A root cause is one of a fixed set of patterns per category, so the solution is always logically reachable.

**Difficulty** (set per save game) changes the simulation: how many misleading symptoms appear, how often clients give wrong information, how many dead ends a ticket has, and how much time each step takes.

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

## 7. Staff

### 7.1 Employees

Each person has:
- **Name, age, background** (generated)
- **Skills:** Hardware, Networking, Windows, Linux, Cloud, Security, Email, Customer talk, Documentation, Project management, Sales (levels 0-10)
- **Traits:** e.g. Fast but sloppy, Careful but slow, Great with customers but nervous, Knows everything about printers, Burnout risk
- **Energy and stress:** affects speed and error rate; too much stress causes sick days or quitting
- **Salary and mood**
- **XP and level**

### 7.2 Staff actions

- Hire (from candidates with varying quality and salary)
- Train (courses take time and money; certifications unlock contracts)
- Assign to tickets, queues, or shifts
- Give time off
- Promote, give bonuses, or fire (fire = severance and reputation risk)

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

- **Main screen:** office view (simple illustration), inbox, staff list, today's schedule.
- **Ticket board:** kanban-like columns (New, Assigned, In progress, Waiting for client, Escalated, Done).
- **Ticket view:** description, chat/mail with the client, remote session terminal, notes, time tracker.
- **Finance:** cash, invoices, costs, forecast.
- **Staff:** cards with skills, mood, and history.
- **Market:** competitors, client leads, news.
- **Knowledge base:** articles the company has written.
- **Settings:** language, speed, AI on/off, AI model, sound, accessibility options.

Design: clean UI with a **dark mode and a white mode**, desktop first. Works at phone width for reading only (no requirement to play on a phone in version 1). The visual base is the front end of **RP-Management-Board** (`apps/web/public/css/theme-v3.css`, which already has dark and light token sets), used as inspiration for layout and colours.

## 14. Modules (roadmap)

Version 1 is the **IT service desk**. Later modules are planned only:

| Module | Adds |
|--------|------|
| Service desk (v1) | Tickets, staff, contracts, office, economy, events, AI text, hardware repair, Active Directory, server room and cabinets |
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

### Server room and cabinets (Systems module)

- **Racks:** cabinets have units (U). Servers, switches, patch panels, UPS units, and PDUs take units. Placement is a drag-and-drop view.
- **Power and cooling:** each device draws power and produces heat. The rack has a power budget and a cooling limit. Overloading causes outages and overheating events, which fit the "server room is 35 degrees" ticket type.
- **UPS:** protects against power cuts. Battery runtime depends on load. A dead battery is a hidden risk until the next outage.
- **Cabling:** patch cables and labels. Wrong or unlabelled cabling makes every future ticket slower.
- **Capacity planning:** adding a server needs free units, power, and cooling. Not enough space means a bigger rack, a second cabinet, or a rented data centre slot (monthly cost).
- **Lifecycle:** devices have age, warranty, and failure rate. Planned replacement is cheaper than emergency replacement.
- **Physical access:** locked cabinets, key holders, visitor log. Missing access control is a security finding.
- **Typical tickets:** RAID disk failure, server beeping at night, cooling failure, power cut with a dead UPS, replacing a switch with a spare, moving a rack.

## 15. Scope for version 1

**In:**
- Founding and company stats
- Client types and contracts (pay-per-incident, support contract)
- Ticket system with investigation, remote terminal, escalation, knowledge base
- Staff hiring, training, stress and energy, sick days
- Basic office and tool upgrades
- Hardware repair workshop (diagnosis, repair, parts, RMA, loaner devices, write-off) (section 6.5)
- Active Directory: users, groups, OUs, GPOs, onboarding and offboarding, admin tiers, replication and DNS tickets (section 14.1)
- Server room and cabinets: racks, rack units, power and cooling, UPS, cabling, lifecycle, physical access (section 14.1)
- Economy with cash flow and bankruptcy
- Random events and market (basic)
- Local AI text generation (optional) with template fallback and about 100 default tickets
- Single-player and co-op. Each save game is either single-player or co-op. Co-op save games are separate from single-player ones.
- A user can have single-player and co-op save games at the same time.
- Save games: name the company, choose difficulty, autosave
- Settings per user: language (German or English), dark or white mode, game speed, AI on/off
- Real-time play with no fixed rounds

**Out (later):**
- Leaderboards and shared market between different companies (open point, see section 16)
- Other modules from section 14
- Mobile play
- Mods and scripting
- Real-world integrations (no internet calls except the optional AI endpoint)

## 16. Open questions

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