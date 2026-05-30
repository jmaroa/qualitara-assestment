# admin-summary-idle-state Specification

## Purpose
TBD - created by archiving change fix-initial-loading-state. Update Purpose after archive.
## Requirements
### Requirement: Do not show a loading panel before the first request
The system MUST treat the main page as idle before the user submits the first summary request.

#### Scenario: First load is idle
- **WHEN** the user first opens or reloads the page and has not submitted the form
- **THEN** the page does not show the `Loading summary…` panel

### Requirement: Preserve the real loading state after submission
The system MUST continue to show a loading state when a submitted summary request is actually in flight.

#### Scenario: Submitted request is loading
- **WHEN** the user submits a valid summary request and the query is in flight
- **THEN** the page shows the `Loading summary…` panel until the request resolves

