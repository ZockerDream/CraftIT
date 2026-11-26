# CraftIT: Agent notes

Working state for coding agents. Keep it short and current.

## Current state

- [Concept.md](Concept.md) is complete for version 1, including ITIL 4 practices, the workshop with a detailed workbench, server room with racks and cabling, Active Directory, the work computer, accounts, save games, and server admin.
- The clickable mockup is in [mockup/craftit-mockup.html](mockup/craftit-mockup.html). It is the visual and functional reference for version 1.0.0.
- Release tag `Mockup/Concept` marks this state.
- Main branch: `develop`. No application code yet.

## Next steps

1. Version 1.0.0 ("base"): build everything from the mockup as a working application with accounts, save games, persistence, and the server admin panel. Record the stack in [Technical.md](Technical.md).
2. Test the application end to end with Playwright.
3. Commit and tag `v1.0.0`.
4. Later: move game rules to the server, add the local LLM content provider, co-op in real time, English translation.

## Open points

- Time model (Concept.md section 16): the mockup uses a clock that runs while the save game is open, plus "Schicht beenden" on demand. The owner has not confirmed this yet.
- English UI text: the language setting exists, the texts are German only.

## Workflow

- Read [README.md](README.md), [Concept.md](Concept.md), and [Technical.md](Technical.md) before changing code.
- Keep changes small. Verify by running the app or the tests before reporting success.
- Add a [Changelog.md](Changelog.md) entry for every user-visible change.
- Update this file when the state or the open points change.

## How to release

1. Move the entries under `[Unreleased]` in [Changelog.md](Changelog.md) to a new section with the version and date.
2. Update the version in `package.json` (once code exists).
3. Commit on `develop` with a message that names the version.
4. Create an annotated tag `vX.Y.Z` (or a named tag such as `Mockup/Concept` for documentation milestones) and push the branch and the tag.
