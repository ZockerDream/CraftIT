# Claude Code: CraftIT

Instructions for Claude Code when working in this repository.

## Project context

CraftIT is a project in early setup. Read [README.md](README.md), [Concept.md](Concept.md), and [Technical.md](Technical.md) first. The current state and open points are in [agent.md](agent.md).

## Working rules

- Branches: `develop` is the main branch. Commit and push to `develop`. Tag releases `vX.Y.Z` on `develop`.
- Build what [Concept.md](Concept.md) describes for version 1. Do not add features that are not in it without asking.
- Record any stack or architecture change in [Technical.md](Technical.md) with the date.
- Keep everything local by default. No telemetry, analytics, or third-party calls unless the concept allows them.
- Never commit API keys, passwords, or secrets. Read them from environment variables or a git-ignored `.env` file.
- Keep changes small. Verify by running the app or the tests before reporting success.
- Add a [Changelog.md](Changelog.md) entry for every user-visible change.

## Conventions

- Language for code and comments: English.
- Documentation: English, unless the owner asks otherwise for a document.
