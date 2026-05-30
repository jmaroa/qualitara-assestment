## 1. Service tests first

- [x] 1.1 Write failing tests for `getWeekBoundaries` covering a normal 7-day window, month boundaries, and exclusive upper bound output
- [x] 1.2 Write failing aggregation tests covering district totals, per-school totals, top-3 ranking, cross-school teacher deduplication, and empty-district behavior

## 2. Service implementation

- [x] 2.1 Implement `getWeekBoundaries` in `server/services/` with UTC-safe date arithmetic and `@spec` JSDoc
- [x] 2.2 Implement weekly district summary aggregation in `server/services/` using the existing `lib/db/` query function(s)
- [x] 2.3 Add any minimal `lib/db/` query support needed by the service without moving business logic into the data layer

## 3. tRPC procedure

- [x] 3.1 Add failing router tests for `reports.weeklyDistrictSummary` input validation and success response shape
- [x] 3.2 Implement the `reports.weeklyDistrictSummary` procedure with Zod validation, delegation to the service, and structured boundary error handling
- [x] 3.3 Wire the reports router into `server/routers/index.ts`

## 4. Verification

- [x] 4.1 Run `pnpm test` and make all new tests pass
- [x] 4.2 Run `pnpm typecheck` and fix any type issues
