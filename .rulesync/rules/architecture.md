---
alwaysApply: true
---

# Architecture

## Single Next.js full-stack app

This is an internal tool with a small scope. Everything lives in one Next.js
app — no separate API server, no microservices, no Docker.

## Layer separation

```
app/          → UI (React Server Components + client components)
server/
  routers/    → tRPC procedures (input validation, delegation to services)
  services/   → Pure business logic (aggregation, date math)
lib/
  db/         → SQLite connection + query functions
  trpc/       → tRPC wiring (context, procedures, client, server caller)
```

Business logic lives in `server/services/`. It has no framework dependencies
and is fully testable without tRPC or Next.js.

tRPC procedures validate input and delegate to services. They do not contain
business logic.

UI components render data. They do not query the database directly.

## Data access

All database queries go through `lib/db/`. No raw SQL in routers or services.
Services call query functions from `lib/db/` and transform results.

## Error handling at boundaries

tRPC procedures catch and return structured errors. Services throw — the
procedure layer catches. The app must never crash on bad input.

## Zod at all inputs

All tRPC inputs are validated with Zod. No unvalidated user input reaches
service functions.
