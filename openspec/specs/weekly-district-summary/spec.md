# Weekly District Summary

## Purpose

Weekly per-school usage summaries for Customer Success: given a district and week-ending date, the system computes a sliding 7-day window, aggregates usage events, and exposes the result through a validated tRPC procedure.

## Requirements

### Requirement: Compute sliding week boundaries from a week-ending date
The system MUST compute a 7-day sliding window where the provided `weekEndingDate` is included and the week start is exactly 6 days earlier.

#### Scenario: Return a 7-day inclusive window
- **WHEN** a caller provides a valid `weekEndingDate`
- **THEN** the system returns `weekStarting`, `weekEnding`, and an exclusive upper bound for the next day consistent with a 7-day inclusive window

#### Scenario: Handle month boundaries correctly
- **WHEN** the 7-day window crosses from one month into the previous month
- **THEN** the computed `weekStarting` and exclusive upper bound remain correct

### Requirement: Aggregate a weekly district summary from usage events
The system MUST return a structured district summary that includes district-level totals and a per-school breakdown for the requested district and week.

#### Scenario: Return district and school totals
- **WHEN** usage events exist for the requested district and week
- **THEN** the summary includes district-level active teachers, total events, top 3 event types, and per-school active teachers, total events, and top 3 event types

#### Scenario: Do not double-count district teachers across schools
- **WHEN** the same teacher has events in multiple schools in the same district during the requested week
- **THEN** the district-level `totalActiveTeachers` counts that teacher once while each school counts that teacher within its own totals

#### Scenario: Return zero totals for an empty district/week
- **WHEN** no usage events exist for the requested district in the requested week
- **THEN** the summary returns zeroed district totals and an empty `schools` array

#### Scenario: Break top event type ties deterministically
- **WHEN** event types have the same count within a district or school
- **THEN** the top event types are ordered alphabetically by event type after sorting by count descending

### Requirement: Expose weekly district summary through tRPC
The system MUST expose a `reports.weeklyDistrictSummary` tRPC procedure that validates input and returns the weekly district summary shape.

#### Scenario: Reject invalid input
- **WHEN** a caller provides an empty `districtId` or an invalid `weekEndingDate`
- **THEN** the procedure rejects the request through schema validation

#### Scenario: Return summary for valid input
- **WHEN** a caller provides a valid `districtId` and `weekEndingDate`
- **THEN** the procedure returns the structured weekly district summary for that district and week
