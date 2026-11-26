# CraftIT: Technical

Record every stack or architecture change here, with the date.

## Stack

| Area | Choice | Since |
|------|--------|-------|
| Mockup | Single HTML file with inline CSS and JavaScript, no build step | 2026-11-26 |
| Language / runtime | TBD (chosen for version 1.0.0) | - |
| Backend | TBD | - |
| Frontend | TBD | - |
| Database | TBD | - |
| Deployment | TBD (Docker) | - |

## Architecture

Planned:

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

> Will be defined with version 1.0.0.

## Configuration and secrets

- Secrets come from environment variables or a git-ignored `.env` file. Never commit them.

## Decisions

| Date | Decision | Reason |
|------|----------|--------|
| 2026-11-26 | Build a clickable single-file mockup before any application code | Agree on screens and flows with the owner before choosing the stack |
| 2026-11-26 | Fictional OS name "WinSec-OS" in all simulated systems | No real product names in the game |
