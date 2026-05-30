---
alwaysApply: true
---

# Code Quality

## TypeScript strict mode — no exceptions

- No `any` types — use `unknown` and narrow with type guards or Zod
- No type assertions with `as` unless absolutely necessary (external library types only)
- Use Zod-inferred types for validated inputs (`z.infer<typeof schema>`)

## No helpers for one-time use

Do not extract a function or utility unless it is used in at least two places.
Three similar lines of code is better than a premature abstraction.

## Scope discipline

Do not add features, refactoring, or "improvements" beyond what was asked.
A bug fix does not need surrounding code cleaned up.
A simple feature does not need extra configurability.

## Component structure

UI components live in `components/ui/` (shadcn primitives).
Domain components live alongside their feature pages or in `components/`.
Never put business logic in UI components.

## Imports

Use the `@/` path alias for all project imports.

```typescript
import { cn } from "@/lib/utils";
import { api } from "@/lib/trpc/client";
```

## Error handling

Handle errors at system boundaries (tRPC procedures, route handlers).
Do not add try/catch blocks inside service functions unless recovering
from a specific, expected error. Let unexpected errors propagate.

## No comments for obvious code

Do not add comments explaining what code does if the code is self-evident.
Add comments only when the *why* is non-obvious.
