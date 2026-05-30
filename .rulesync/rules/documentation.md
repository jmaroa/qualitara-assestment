---
description: Documentation standards — when to write JSDoc, what to document, how to keep it useful
---

# Documentation

## Document why, not what

Code shows what it does. Documentation explains *why* it does that — the
constraint, the decision, the surprising thing.

If removing a comment would not confuse a future reader, do not write it.

## JSDoc — when required

Required for:
- Public functions exported from `lib/*` and `server/services/*`
- tRPC procedures in `server/routers/*`
- Any non-obvious algorithm (e.g., date boundary computation)

Not required for:
- React components (props types document the API)
- Internal helpers used in a single file
- Self-evident getters, setters, type aliases

## Inline comments

Use inline comments only for:
- A workaround for a specific bug
- A subtle invariant that the code does not express
- A constraint imposed by an external system

## Keep docs in sync with code

When you change behavior, update:
- The relevant spec under `openspec/specs/`
- Any JSDoc that referenced the old behavior
- `docs/technical-design.md` if the architecture changes
- `AGENTS.md` only if a non-negotiable rule changes
