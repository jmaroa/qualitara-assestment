## Why

The summary endpoint now exists, but the assessment also requires a usable internal admin interface where a CSM can request and review a district’s weekly report without manual formatting. We need the main page UI that turns the backend summary into a scannable, copyable, print-friendly internal tool.

## What Changes

- Build the main page admin UI with a `district_id` text field and week-ending date picker.
- Show a district summary card with total active teachers, total events, and top 3 event types.
- Show a sortable per-school breakdown table that can sort by active teachers or total events.
- Handle loading, empty, and error states explicitly.
- Add a Copy Summary button that copies a text-formatted report to the clipboard.
- Add print-friendly CSS using `@media print`.
- Install and use shadcn/ui components as needed for table, button, input, card, and select.

## Capabilities

### New Capabilities
- `admin-usage-summary-ui`: Main-page internal UI for requesting, reviewing, copying, and printing a weekly district usage summary.

### Modified Capabilities

<!-- none -->

## Impact

- `app/page.tsx` and possible supporting UI components
- `app/globals.css` for print styling
- `lib/trpc/client.tsx` or related client-query usage on the page
- `components/ui/` additions from shadcn/ui
- UI-focused tests for key states and interactions
