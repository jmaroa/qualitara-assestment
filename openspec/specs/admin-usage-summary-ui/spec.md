# Admin Usage Summary UI

## Purpose

Internal main-page tool for CSMs to request a district weekly usage summary, review district and per-school totals, and copy or print a handoff-ready report without manual formatting.

## Requirements

### Requirement: Allow a CSM to request a weekly district summary from the main page
The system MUST provide a main-page form where a CSM can enter a `district_id` and choose a week-ending date to request the weekly district summary.

#### Scenario: Submit valid inputs
- **WHEN** the user enters a non-empty `district_id`, selects a valid week-ending date, and submits the form
- **THEN** the system requests the weekly district summary and updates the page with the result

### Requirement: Show explicit UI states for summary requests
The system MUST explicitly render loading, empty, error, and success states for the weekly district summary request.

#### Scenario: Show loading state
- **WHEN** a summary request is in flight
- **THEN** the page shows a visible loading state instead of stale or blank content

#### Scenario: Show empty state
- **WHEN** the summary request succeeds but returns zero totals and no schools
- **THEN** the page shows an explicit empty state indicating there is no data for that district/week

#### Scenario: Show error state
- **WHEN** the summary request fails because of invalid input or backend failure
- **THEN** the page shows an explicit error state instead of silently failing

### Requirement: Present district totals and school breakdown in a scannable layout
The system MUST display district-level totals and a per-school breakdown table suitable for internal-tool use.

#### Scenario: Show district summary card
- **WHEN** summary data is available
- **THEN** the page shows total active teachers, total events, and top 3 event types in a summary card

#### Scenario: Show sortable per-school table
- **WHEN** summary data is available
- **THEN** the page shows a per-school breakdown table that can sort by active teachers or total events

### Requirement: Support copyable and printable output
The system MUST make the summary easy to hand off to a district admin via copy/paste or print.

#### Scenario: Copy text-formatted summary
- **WHEN** the user clicks the Copy Summary button
- **THEN** the system copies a text-formatted report containing the district totals and per-school breakdown to the clipboard

#### Scenario: Print-friendly layout
- **WHEN** the user prints the page
- **THEN** interactive-only controls are hidden and the summary content is formatted for readable print output
