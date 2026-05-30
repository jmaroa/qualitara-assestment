## 1. UI primitives and page scaffold

- [x] 1.1 Install/add the needed shadcn/ui primitives (`table`, `button`, `input`, `card`, and `select` if used)
- [x] 1.2 Read the current `app/page.tsx` and create the minimal component structure for the admin summary page
- [x] 1.3 Add any page-level/client component split needed for form state, sorting, clipboard, and query interactions

## 2. Query states and summary presentation

- [x] 2.1 Wire the form to `reports.weeklyDistrictSummary` using the existing tRPC client setup
- [x] 2.2 Implement explicit loading, empty, error, and success states
- [x] 2.3 Render the district summary card with totals and top 3 event types

## 3. School breakdown interactions

- [x] 3.1 Render the per-school breakdown table
- [x] 3.2 Add local sorting by `activeTeachers` and `totalEvents` with deterministic tie behavior
- [x] 3.3 Add the Copy Summary button with clipboard text formatting and user feedback

## 4. Polish and verification

- [x] 4.1 Add print-friendly `@media print` styles in `app/globals.css`
- [x] 4.2 Add UI tests for at least the key states/interactions that carry real failure risk
- [x] 4.3 Run `pnpm test` and `pnpm typecheck`
