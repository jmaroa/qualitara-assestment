## Context

Per `docs/adr/0001-sqlite-with-better-sqlite3.md`, the assessment uses a local SQLite file with raw SQL executed via `better-sqlite3` for zero reviewer setup.

Per `docs/adr/0002-aggregation-strategy-and-date-semantics.md`, report queries will filter events by `district_id` and a 7-day inclusive window using an exclusive upper bound (`timestamp < nextDay`). This change sets up the data layer primitives (db file, schema, seed) required to implement those aggregations.

## Goals / Non-Goals

**Goals:**
- Provide a single-file SQLite database reachable from server-side code (tRPC/services) via `lib/db/`.
- Create the `usage_events` table (and indexes) exactly as described in `docs/technical-design.md`.
- Provide a deterministic, synthetic seed generator producing:
  - 3 districts
  - 2–4 schools per district
  - 5–15 teachers per school
  - ~2000 events spread across the last 4 weeks
- Provide query functions (parameterized SQL) for the main access pattern:
  - filter by `district_id`
  - filter by `[weekStarting, weekEnding + 1 day)`
- Establish TDD coverage for the query functions without relying on a long-lived on-disk DB.

**Non-Goals:**
- Implement the aggregation/service layer for weekly summaries (handled in a separate change).
- Add additional tables (districts, schools, teachers) or migrations tooling.
- Add ORM/Drizzle/Prisma abstractions.

## Decisions

- **DB driver:** `better-sqlite3` with raw SQL.
  - Rationale: matches ADR-0001; synchronous API; minimal moving parts.

- **DB location/config:**
  - Production/dev app runtime uses an on-disk `.sqlite` file (path via env, validated in `lib/env.ts`), created/seeded via `pnpm db:seed`.
  - Tests use an in-memory SQLite database (`:memory:`) with the same schema initializer to avoid filesystem coupling.

- **Schema creation:**
  - A small schema initializer function in `lib/db/` creates:
    - `usage_events` table with columns: `id`, `teacher_id`, `school_id`, `district_id`, `event_type`, `timestamp` (ISO 8601 TEXT)
    - index on `(district_id, timestamp)` for query path

- **Seeding strategy:**
  - Seed script generates IDs as stable strings (e.g., `district-1`, `school-1-2`, `teacher-1-2-03`) and timestamps in UTC ISO format.
  - Event types come from a fixed small set to make “top event types” meaningful later.

- **Query functions:**
  - Provide focused functions in `lib/db/queries.ts` (or similar) returning typed rows.
  - Date filtering uses the exclusive upper bound pattern from ADR-0002:
    - `timestamp >= weekStarting`
    - `timestamp < weekEndingPlusOne`

## Risks / Trade-offs

- **Risk:** Synthetic data might accidentally skew (e.g., no events for a district) → **Mitigation:** seed generator enforces at least some events per district and spreads events across weeks.
- **Risk:** ISO string comparisons assume consistent formatting/timezone → **Mitigation:** generate timestamps as full UTC ISO strings; range bounds passed as `YYYY-MM-DD` or `YYYY-MM-DDT00:00:00.000Z` consistently; tests lock behavior.
- **Trade-off:** No migrations/versioning → acceptable for assessment; schema recreated by seed.
