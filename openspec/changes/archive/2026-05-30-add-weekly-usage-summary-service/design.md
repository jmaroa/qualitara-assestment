## Context

The original assessment requires an HTTP endpoint and admin-facing workflow that returns a weekly per-school usage summary for a district. The SQLite data layer and deterministic seed data already exist, so the next step is to add the pure service logic in `server/services/` and the tRPC procedure that validates input and exposes the summary.

This change must follow `docs/adr/0002-aggregation-strategy-and-date-semantics.md`: a 7-day sliding window ending on the provided date, queried with an exclusive upper bound, with SQL/JS hybrid aggregation and deterministic tie-breaking for top event types.

## Goals / Non-Goals

**Goals:**
- Add a pure `getWeekBoundaries` function for `weekEndingDate -> weekStarting/weekEnding/weekEndingPlusOne`
- Add a usage summary service that consumes filtered usage events and returns the summary shape from `docs/technical-design.md`
- Count unique district-level teachers once across all schools while still counting school-level teachers per school
- Sort top event types deterministically by count descending, then event type ascending
- Expose `reports.weeklyDistrictSummary` via tRPC with Zod input validation and boundary-level error handling
- Write tests first for date boundaries and aggregation edge cases

**Non-Goals:**
- Build the admin UI in this change
- Add caching, materialized views, or alternative week semantics
- Introduce new database tables or change the seed dataset shape

## Decisions

- **Service-first implementation:**
  - Business logic lives in `server/services/` and stays framework-free.
  - The router only validates input and delegates.

- **Boundary computation:**
  - `getWeekBoundaries` accepts a `YYYY-MM-DD` string and returns ISO date strings for `weekStarting`, `weekEnding`, and `weekEndingPlusOne`.
  - Date math uses UTC-safe parsing and day arithmetic to avoid month-boundary and off-by-one bugs.

- **Aggregation approach:**
  - Reuse the existing data-layer query that filters by district and date range.
  - Aggregate in JavaScript from the filtered rows for district totals, school totals, and top event type ranking.
  - Return empty summary totals and an empty `schools` array for a district/week with no events.

- **Router behavior:**
  - Add a nested `reports` router with `weeklyDistrictSummary`.
  - Validate input with Zod (`districtId` non-empty, `weekEndingDate` valid ISO date string).
  - Catch boundary errors in the procedure and return structured tRPC errors without leaking internals.

## Risks / Trade-offs

- **Risk:** Date parsing bugs around month transitions or end-of-day filtering → **Mitigation:** TDD for month boundaries and exclusive upper bound behavior.
- **Risk:** District-level active teachers could be double-counted across schools → **Mitigation:** Use a district-wide teacher set and separate per-school teacher sets in aggregation.
- **Trade-off:** In-memory JS aggregation is simpler and testable for assessment-scale data, but would need reconsideration for much larger datasets.
