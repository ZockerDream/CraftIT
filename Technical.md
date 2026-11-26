# CraftIT: Technical

Record every stack or architecture change here, with the date.

## Stack

| Area | Choice | Since |
|------|--------|-------|
| Language / runtime | TBD | - |
| Backend | TBD | - |
| Frontend | TBD | - |
| Database | TBD | - |
| Deployment | TBD (Docker?) | - |

## Architecture

Planned (not built yet):

```
Browser (game UI)  <-->  Game server (API + save data)  <-->  PostgreSQL or SQLite
                                  |
                                  |  OpenAI-compatible HTTP (optional)
                                  v
                         Local LLM container (llama.cpp)
```

- **Game logic is deterministic** and lives on the server (or in one shared module). The AI never decides outcomes (see Concept.md section 12).
- **Content generator** has two providers: `llm` (local model) and `template` (offline). Both produce the same JSON schema. The game runs with `template` only.
- **Background job** pre-generates tickets and dialogues in batches and stores them.
- **Local LLM** follows the Compain setup: llama.cpp server, GGUF model, CPU by default, optional NVIDIA GPU. Model client is OpenAI-compatible; `mock` URL for tests.

## Content generation

| Item | Decision | Since |
|------|----------|-------|
| Provider interface | `ContentProvider` with `llm` and `template` implementations | 2026-11-26 |
| Output format | Strict JSON schema per content type, validated before use | 2026-11-26 |
| Retry and fallback | Invalid output: retry up to 2 times, then template | 2026-11-26 |
| Pregeneration | Background batches stored in DB, player never waits on the model | 2026-11-26 |
| Filter | Forbidden-content and real-name checks before storage | 2026-11-26 |

## Data model

> TODO: Main entities and their relations.

## Configuration and secrets

- Secrets come from environment variables or a git-ignored `.env` file. Never commit them.

## Decisions

| Date | Decision | Reason |
|------|----------|--------|
| - | - | - |
