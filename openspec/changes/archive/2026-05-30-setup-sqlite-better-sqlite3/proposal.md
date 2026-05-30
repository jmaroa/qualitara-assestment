## Why

We need a zero-config local data store and deterministic dataset so reviewers can run the app (and we can test aggregation) without external dependencies.

## What Changes

- Add a SQLite database powered by `better-sqlite3` with a single `usage_events` table.
- Add a seed script that generates synthetic data (3 districts, 2–4 schools each, 5–15 teachers per school, ~2000 events across 4 weeks).
- Add data-layer query functions to fetch usage events filtered by `district_id` and an inclusive 7-day window (exclusive upper bound) to support weekly reports.
- Add unit tests (TDD) for the query functions.

## Capabilities

### New Capabilities
- `sqlite-data-layer`: SQLite connection, schema creation, synthetic seeding, and query functions for district + date-range filtering.

### Modified Capabilities

<!-- none -->

## Impact

- New code under `lib/db/` for connection + queries.
- New script(s) for schema/seed (likely under `lib/db/` and/or `scripts/`).
- New tests under `lib/db/__tests__/` (or equivalent test location).
- Adds dependency on `better-sqlite3` (already accepted in ADR-0001).
