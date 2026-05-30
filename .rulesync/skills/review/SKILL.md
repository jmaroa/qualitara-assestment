---
name: review
description: Review code for correctness, architecture fit, type safety, and test coverage. Returns a structured assessment.
userInvocable: true
---

Review the following code or change: $ARGUMENTS

## Review checklist

### Architecture
- [ ] Business logic lives in `server/services/`, not in routers or UI
- [ ] Data access goes through `lib/db/`, not raw SQL in services
- [ ] tRPC procedures validate input with Zod and delegate to services
- [ ] Layer boundaries are respected (UI → router → service → db)

### TypeScript
- [ ] No `any` types
- [ ] No unnecessary `as` assertions
- [ ] Types derived from Zod schemas where applicable
- [ ] Strict mode passes (`pnpm typecheck`)

### Testing
- [ ] Service functions have corresponding tests
- [ ] Tests follow Arrange-Act-Assert pattern
- [ ] Tests describe behavior, not implementation
- [ ] Edge cases covered (empty data, boundary dates, invalid input)

### Error handling
- [ ] tRPC procedures return structured errors for invalid input
- [ ] Empty results return 200 with zeroed summary, not 404
- [ ] No unhandled promise rejections
- [ ] No errors leak internal details

### Scope discipline
- [ ] Change is scoped to what was asked — no unrequested additions
- [ ] No helpers or utilities created for one-time use
- [ ] No extra configurability or abstraction

### Data correctness (if touching aggregation)
- [ ] Week boundaries use exclusive upper bound (`< next day`)
- [ ] Active teachers counted with `COUNT(DISTINCT teacher_id)`
- [ ] Top 3 event types have deterministic tie-breaking
- [ ] District-level counts do not double-count cross-school teachers

## Output format

For each section: **Pass**, **Issue: [description]**, or **N/A**.

End with: **Overall: Pass / Needs changes** + a list of required changes (if any).
