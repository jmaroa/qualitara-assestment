---
description: Non-trivial functions should link back to the spec that defined their behavior via a @spec JSDoc tag.
---

# Spec Traceability

## Rule

When implementing from a spec, add a `@spec` JSDoc tag to the function or
procedure that implements the behavior.

```typescript
/**
 * Computes the 7-day window boundaries from a week-ending date.
 *
 * @spec docs/adr/0002-aggregation-strategy-and-date-semantics.md
 */
export function getWeekBoundaries(weekEndingDate: string) { ... }
```

## When required

- Any tRPC procedure that implements a Functional Requirement from a spec
- Any service function that implements aggregation logic defined in an ADR
- Any utility in `lib/` that implements a rule from the architecture docs

## When not required

- Internal helpers with no spec coverage
- UI components
- Configuration files
- Seed scripts

## Format

```
@spec <relative-path-to-spec>[#section-anchor]
```

Examples:
- `@spec openspec/specs/001-usage-summary-endpoint.md`
- `@spec docs/adr/0002-aggregation-strategy-and-date-semantics.md`
