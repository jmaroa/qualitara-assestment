---
name: implement
description: Implement a feature. Reads docs, proposes a plan, writes failing test first (TDD), waits for confirmation on architecture decisions, then implements.
userInvocable: true
---

Implement the following feature: $ARGUMENTS

## Workflow

### 1. Read docs

Identify and read the relevant docs:
- `docs/technical-design.md` — always read first
- `docs/adr/0001-sqlite-with-better-sqlite3.md` — if touching data layer
- `docs/adr/0002-aggregation-strategy-and-date-semantics.md` — if touching aggregation or dates
- Any spec in `openspec/specs/` relevant to the feature

### 2. Read current file state

Before editing any file, read its current state.
Do not write code based on assumptions about what a file contains.

### 3. Propose a plan

Write a bullet-point plan (max 6 items) that includes:
- What you will do
- What you will NOT do
- Any assumptions

If the plan involves architecture decisions — **stop and wait for confirmation**.

### 4. Write tests first (TDD)

For any service function or tRPC procedure:

1. Write the test file with failing tests
2. Run `pnpm test` — verify the tests fail for the right reason
3. Then implement the production code
4. Run `pnpm test` — verify the tests pass
5. Refactor if needed

TDD is **required** for:
- Service functions in `server/services/`
- tRPC procedures in `server/routers/`
- Utility functions in `lib/` that have logic (not trivial wrappers)

TDD is **not required** for:
- UI components (test after if needed)
- Configuration files
- Seed scripts
- Type definitions

### 5. Implement

Follow the plan. Stay within the scope of what was asked.

**Non-negotiable constraints:**
- No `any` types, no unnecessary `as` assertions
- Zod validation on all tRPC inputs
- Business logic in `server/services/`, not in routers
- No features beyond what was asked
- No helpers or utilities for one-time use
