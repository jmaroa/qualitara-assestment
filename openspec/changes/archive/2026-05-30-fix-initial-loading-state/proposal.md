## Why

On first load or reload, the main page incorrectly shows a `Loading summary…` panel before the user has submitted any request. That makes the UI feel broken or busy when it is actually idle, so we should distinguish the pre-submit idle state from a real in-flight loading state.

## What Changes

- Fix the main-page query state handling so the page does not show `Loading summary…` before any report request has been submitted.
- Add an explicit idle state for the admin summary page.
- Add UI test coverage for the initial idle state and for the real loading state after a submission begins.

## Capabilities

### New Capabilities
- `admin-summary-idle-state`: Main-page idle state behavior before the first summary request is submitted.

### Modified Capabilities

<!-- none -->

## Impact

- `components/admin-usage-summary-page.tsx`
- UI tests for the admin summary page
- Possible small updates to related page copy or conditional rendering logic
