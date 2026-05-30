---
alwaysApply: true
---

# Agent Behavior

## Before every task

1. State which docs you read (be specific — file paths)
2. Propose a short implementation plan (bullet list, max 6 items)
3. List any assumptions you are making
4. Wait for confirmation if the plan involves architecture decisions
5. Then implement

Do not skip this sequence. Wasted implementation is more expensive than planning.

## Reading docs

Before writing code, read the relevant doc in `/docs/`. The docs are the source of truth — not assumptions, not prior experience with similar projects.

Key docs for this project:
- `docs/technical-design.md` — system blueprint
- `docs/adr/0001-sqlite-with-better-sqlite3.md` — data store choice
- `docs/adr/0002-aggregation-strategy-and-date-semantics.md` — aggregation + date semantics

If a pattern is not in the docs, propose it before implementing it.

## Checking file state

Before editing a file, read its current state.
Do not write code based on what you think the file contains.

## Command execution

- Use `pnpm` scripts defined in `package.json` — do not invent alternative commands
- Wrap file paths in quotes when passing to shell commands

## File creation

Create only files that are necessary for the task.
Do not create documentation, README files, or test files unless explicitly asked.

## Scope discipline

Do not add features, refactoring, or "improvements" beyond what was asked.
A bug fix does not need the surrounding code cleaned up.
A simple feature does not need extra configurability.
