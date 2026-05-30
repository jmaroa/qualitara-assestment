## 1. Data layer scaffolding

- [x] 1.1 Add `better-sqlite3` dependency (if not already present) and any required Node typings
- [x] 1.2 Implement SQLite connection module in `lib/db/` (on-disk + in-memory for tests)
- [x] 1.3 Implement schema initializer for `usage_events` table + `(district_id, timestamp)` index

## 2. Query functions (TDD)

- [x] 2.1 Write failing unit tests for “filter by district + date range (exclusive upper bound)” query
- [x] 2.2 Implement query function(s) to fetch usage events by `districtId` and `[weekStarting, weekEndingPlusOne)`
- [x] 2.3 Add unit test for schema initialization (table/index existence)

## 3. Seed script

- [x] 3.1 Implement deterministic synthetic data generator (3 districts, 2–4 schools each, 5–15 teachers per school, ~2000 events across 4 weeks)
- [x] 3.2 Implement `pnpm db:seed` script to create/overwrite the on-disk `.sqlite` file and run schema + seed
- [x] 3.3 Add a lightweight sanity test (or script output assertion) that seed produced roughly expected counts
