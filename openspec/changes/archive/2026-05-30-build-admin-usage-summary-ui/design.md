## Context

The backend summary service and tRPC procedure now exist, but the assessment also requires an internal admin page where a CSM can request a district/week report, review the result quickly, and hand it off with minimal cleanup. The UI should feel like an internal tool: fast to scan, explicit about loading/empty/error states, and practical for copy/paste and printing.

## Goals / Non-Goals

**Goals:**
- Build the main page UI around the existing `reports.weeklyDistrictSummary` endpoint
- Provide a small input form with `district_id` and week-ending date inputs
- Show a district summary card and per-school breakdown table
- Support sorting by at least `activeTeachers` and `totalEvents`
- Provide a clipboard-friendly text export button
- Add print-friendly CSS using `@media print`
- Use shadcn/ui primitives where they improve consistency and speed

**Non-Goals:**
- Change backend summary behavior or response shape
- Build authentication or navigation
- Add charts, trends, or multi-week comparisons
- Build a marketing-style visual design

## Decisions

- **Single-page client boundary:**
  - Keep `app/page.tsx` as the entry page and introduce a client component boundary only where form state, sorting, clipboard, and query interactions are needed.
  - Server components remain the default elsewhere.

- **Data fetching approach:**
  - Use the existing tRPC React client hooks for the summary query.
  - Render explicit loading, empty, and error states in the page component rather than hiding them behind abstractions.

- **Sorting behavior:**
  - Keep sort state local to the table UI.
  - Support sorting by `activeTeachers` and `totalEvents`; use a deterministic fallback such as `schoolId` for ties.

- **Copy summary format:**
  - Generate plain text in a CSM-friendly layout containing the district, dates, summary totals, and each school row.
  - Trigger clipboard copy from a button click and show lightweight success/failure feedback in the UI.

- **Print styling:**
  - Add `@media print` rules in `app/globals.css` to hide interactive controls and improve spacing/contrast for printed output.

- **shadcn/ui usage:**
  - Add only the primitives needed for this page (`table`, `button`, `input`, `card`, `select` if needed for sort control).

## Risks / Trade-offs

- **Risk:** Too much client-side code at the page root could blur server/client boundaries → **Mitigation:** keep the client boundary low and focused on interactive UI only.
- **Risk:** Copy/print formats may drift from the visible table → **Mitigation:** derive both from the same query result structure.
- **Trade-off:** Explicit state handling is more verbose than a generic abstraction, but it is easier to review and better matches the project’s simplicity rules.
