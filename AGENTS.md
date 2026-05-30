# District Usage Reports — AGENTS.md

This file is the behavioral contract for every AI agent working on this codebase.
Read it fully before writing any code.

---

## The Five Commandments

### 1. Never make architectural decisions without asking

Anything that touches module boundaries, new surfaces, schema changes, or
data store configuration requires explicit user approval before implementation.

### 2. Maintain type safety without `as` coercion

`any` is banned. `as` is banned except for external library gaps.
Reach for a type guard or Zod parse first.

### 3. The application cannot crash

Errors at system boundaries (route handlers, tRPC procedures) must be caught
and returned as structured responses. Internal errors must not leak details.

### 4. Simplicity over abstraction

Do not create helpers or utilities for one-time use. Three similar lines
is better than a premature abstraction. Complexity must be earned.

### 5. Always reference specifications

Every non-trivial feature traces back to a spec under `openspec/specs/` or
the technical design doc. If the work has no spec, write one first.

---

## Project Summary

An internal tool for an EdTech company's Customer Success team.
CSM users query per-school weekly usage summaries by district and date.

**Stack:** Next.js 15 · TypeScript · SQLite · tRPC · Tailwind v4 · shadcn/ui

---

## Architecture

```
app/
  api/trpc/[trpc]/route.ts    ← tRPC HTTP handler
  globals.css                  ← Tailwind v4 theme
  layout.tsx                   ← Root layout + TRPCReactProvider
  page.tsx                     ← Main reports page
lib/
  db/                          ← SQLite connection (TBD)
  trpc/
    init.ts                    ← createTRPCContext, publicProcedure
    server.ts                  ← RSC caller (getServerClient)
    client.tsx                 ← TRPCReactProvider, api
  env.ts                       ← Zod-validated env
  utils.ts                     ← cn()
server/
  routers/
    index.ts                   ← appRouter
  services/                    ← Business logic (aggregation)
docs/
  technical-design.md          ← System blueprint
  adr/                         ← Architecture Decision Records
ai-sessions/                   ← AI conversation exports
openspec/                      ← Spec-driven development
```

---

## Anti-Patterns

| Anti-pattern | Why it's wrong |
|---|---|
| `any` types | Defeats TypeScript strict mode |
| Helpers for one-time use | Unnecessary abstraction |
| Business logic in route handlers | Untestable, coupled to framework |
| Catching errors silently | Hides real bugs |
| Over-engineering for scale | Assessment scope is intentionally small |

---

## Behavior Before Every Task

1. State which docs you read
2. Propose a short implementation plan
3. List any assumptions
4. Then implement
