---
description: One-time project setup — load all rules, docs, and architecture context into session
argument-hint: ""
---

Run a **one-time project setup** to load all project context into this session.

This is NOT `/checkin`. Run this once when starting work on the project for the
first time, or when rules/docs have changed significantly.

## 1) Read project contract

Read fully, in this order:
- `AGENTS.md`
- `docs/technical-design.md`
- `docs/adr/0001-sqlite-with-better-sqlite3.md`
- `docs/adr/0002-aggregation-strategy-and-date-semantics.md`

## 2) Read all project rules

Read every file in `.rulesync/rules/`:
- `.rulesync/rules/agent-behavior.md`
- `.rulesync/rules/architecture.md`
- `.rulesync/rules/code-quality.md`
- `.rulesync/rules/types.md`
- `.rulesync/rules/unit-testing.md`
- `.rulesync/rules/react-components.md`
- `.rulesync/rules/documentation.md`
- `.rulesync/rules/spec-traceability.md`

## 3) Read available skills

Scan `.rulesync/skills/` and `.pi/skills/` to understand what workflows are available.

## 4) Verify environment

Run:
```bash
node --version
pnpm --version
```

Check that `package.json` exists and dependencies are installed:
```bash
ls node_modules/.package-lock.json 2>/dev/null && echo "deps installed" || echo "run pnpm install first"
```

Check that OpenSpec CLI is available:
```bash
openspec --version 2>/dev/null || echo "openspec not available — run pnpm install"
```

## 5) Output

Provide a brief summary:
- **Rules loaded:** list the rule names and their key constraint (one line each)
- **Docs loaded:** list the docs read
- **Skills available:** list the skills and prompts available
- **Environment:** node version, pnpm version, deps installed, openspec available
- **Ready to work:** yes/no + any blockers

After this, the session has full project context. Proceed with `/checkin` for
git status, or `/opsx-propose` to start a change.
