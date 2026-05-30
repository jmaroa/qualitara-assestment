---
alwaysApply: true
description: Unit testing rules — TDD enforced for services and procedures, Arrange-Act-Assert, behavior over implementation
---

# Unit Testing

## TDD is enforced

Write the failing test first. See it fail. Implement. See it pass. Refactor.

**This is non-negotiable.** Do not write production code in `server/services/`
or `server/routers/` without a failing test that defines the expected behavior.

Required for:
- Service functions in `server/services/` (aggregation, date math)
- tRPC procedures in `server/routers/`
- Utility functions in `lib/` that contain logic
- Bugfixes that map to a reproducible scenario

Not required for:
- UI components (test after implementation if needed)
- Configuration files, seed scripts, type definitions
- Trivial wrappers with no logic

**Workflow:**
1. Write the test — it must fail
2. Run `pnpm test` — confirm it fails for the right reason
3. Write the minimum code to make it pass
4. Run `pnpm test` — confirm green
5. Refactor if needed — tests must stay green

## Test behavior, not implementation

Tests should describe *what* the code does — not *how* it does it internally.

Bad:
```typescript
expect(spy).toHaveBeenCalledWith("SELECT * FROM usage_events...");
```

Good:
```typescript
const result = getWeekBoundaries("2026-05-30");
expect(result.weekStarting).toBe("2026-05-24");
```

## Arrange — Act — Assert

Each test follows three sections, in this order, separated by blank lines:

```typescript
it("returns a 7-day inclusive window ending on the given date", () => {
  // Arrange
  const weekEndingDate = "2026-05-30";

  // Act
  const result = getWeekBoundaries(weekEndingDate);

  // Assert
  expect(result.weekStarting).toBe("2026-05-24");
});
```

Do not interleave setup and assertions.

## One assertion per test

A test answers one question. If you find yourself writing `expect()` for three
unrelated things, that is three tests.

Exception: asserting multiple properties of a single returned object is one
assertion (one concept).

## Descriptive test names

Test names describe the scenario, not the function:

Bad:
- `it("getWeekBoundaries")`
- `it("works correctly")`

Good:
- `it("returns a 7-day window ending on the given date")`
- `it("handles month boundaries correctly")`
- `it("returns zero totals for a district with no events")`

Format: `<verb> <subject> when <condition>`.

## No live infrastructure

Unit tests do not:
- Make real network calls
- Connect to a real database (use in-memory SQLite or mocks)
- Start servers or processes

## Isolation between tests

Each test starts from a known state. No test depends on the order of execution
or on side effects from prior tests.

## Test runner

- Unit: **Vitest** (`pnpm test`)
- Do not mix with other test runners
