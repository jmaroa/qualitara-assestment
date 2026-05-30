## Why

The assessment’s core requirement is a weekly per-school usage summary endpoint. Now that the SQLite data layer exists, we need the service and tRPC procedure that turn raw events into the exact summary shape a CSM can request by district and week-ending date.

## What Changes

- Add a usage summary service in `server/services/` that computes sliding 7-day week boundaries from a week-ending date.
- Add aggregation logic that returns district-level totals plus a per-school breakdown with active teachers, total events, and top 3 event types.
- Add a `reports.weeklyDistrictSummary` tRPC procedure with Zod input validation and structured error handling.
- Add TDD coverage first for `getWeekBoundaries` and aggregation logic, including off-by-one, empty district, and month-boundary cases.

## Capabilities

### New Capabilities
- `weekly-district-summary`: Weekly usage summary service and tRPC endpoint for querying a district by week-ending date.

### Modified Capabilities

<!-- none -->

## Impact

- New service code under `server/services/`
- New or updated router code under `server/routers/`
- Possible additions in `lib/db/` for aggregated query helpers used by the service
- New unit tests for service and router behavior
