---
description: TypeScript type hierarchy — Zod schemas over custom types. No `as` except for external boundaries.
---

# Types

## Type hierarchy — prefer in this order

1. **Zod schemas** — when you control the contract (input validation, response shapes)
2. **DB query result types** — for direct database return shapes
3. **Custom types** — only when 1–2 do not fit

Reach for the most specific source available.

## Zod schemas as the contract

When defining a contract (tRPC input, env validation), the Zod schema is the source of truth. Derive the TS type from it:

```typescript
const reportInput = z.object({
  districtId: z.string().min(1),
  weekEndingDate: z.string().date(),
});

type ReportInput = z.infer<typeof reportInput>;
```

Do not write a separate `interface ReportInput` next to the schema.

## No `as` assertions — exceptions

`as` is banned except for:

1. **External library type gaps** — when a typed library returns `unknown`
2. **JSON parse boundaries** — `JSON.parse(...) as MyType` after validating with Zod
3. **SQLite query results** — `better-sqlite3` returns `unknown`, cast after defining the expected shape

For all other cases: use a type guard, narrow with a Zod parse, or refactor.

## Define types outside the function

Type declarations belong above the function or component, not inline.

## Keep types in the file they are used in

Do not create a `types.ts` file unless a type is genuinely shared by 3+ files.

## Avoid `any`

`any` is banned. Use `unknown` and narrow with a type guard or Zod schema.

## Utility types

Reuse `Pick`, `Omit`, `Partial`, `Required`, and `NonNullable` instead of duplicating a structure.
