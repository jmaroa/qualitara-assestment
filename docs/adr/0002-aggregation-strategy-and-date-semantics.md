# ADR 0002 — Hybrid SQL/JS Aggregation with Inclusive 7-Day Sliding Window

## Status

Accepted

## Date

2026-05-30

## Context

The endpoint receives a `district_id` and a `week-ending date` and must
return: active teachers, total events, top 3 event types, and a per-school
breakdown.

The assessment does not define what "week-ending date" means precisely. Two
valid interpretations exist:

1. A **sliding 7-day window** ending on (and including) the given date.
   If the user enters May 30, the range is May 24–May 30.
2. An **ISO calendar week** — the system snaps to the Monday–Sunday week
   containing the given date, regardless of which day the user picks.

The aggregation must also handle:

- Counting "active teachers" (unique teachers with at least one event)
- Ranking event types to produce a top-3 list
- Breaking down all metrics per school
- A teacher active in multiple schools: counted once at district level,
  once per school at the school level

These are domain logic decisions that directly affect data correctness.
Getting them wrong produces silent bugs — the numbers look plausible but
are wrong.

## Decision Drivers

- Correctness: the date range must be unambiguous and testable
- Flexibility: CSMs should be able to pick any day, not just Sundays
- Simplicity: the aggregation code must be explainable line by line
- Testability: date boundary logic must be isolatable as a pure function

## Considered Options

1. Sliding 7-day window (inclusive end date) with hybrid SQL + JS aggregation
2. ISO calendar week with pure SQL aggregation
3. Sliding window with pure JavaScript aggregation (fetch all events, process in memory)

## Decision

We will use a **sliding 7-day window** where `weekEndingDate` is the last
day of the range (inclusive). The week start is computed as
`weekEndingDate - 6 days`, producing a 7-day window: [start, end].

The date range query uses the **exclusive upper bound** pattern to avoid
timestamp precision issues:

```sql
WHERE district_id = ?
  AND timestamp >= ?    -- weekStarting (YYYY-MM-DD)
  AND timestamp < ?     -- weekEnding + 1 day (YYYY-MM-DD)
```

This ensures all events on the last day are included regardless of their
time component, without relying on `<= '23:59:59.999'`.

Aggregation is **hybrid**:

- **SQL** handles filtering by district and date range, GROUP BY school,
  COUNT(*) for total events, and COUNT(DISTINCT teacher_id) for active
  teachers.
- **JavaScript** handles top-3 event type ranking per school and at the
  district level. Ties are broken alphabetically by event type name
  for deterministic output.

## Consequences

### Positive

- The sliding window lets CSMs pick any day — "the week ending last Friday"
  works without snapping to a calendar boundary
- The `< next day` query pattern is a well-known correct approach for
  date-range queries, eliminating the most common precision bug
- The date boundary computation is a pure function (`getWeekBoundaries`)
  that can be unit tested in isolation
- SQL handles the expensive operations (filtering, grouping, counting)
  while JS handles the ranking logic that is awkward in SQLite
- Alphabetical tie-breaking produces deterministic results, which makes
  tests reliable

### Negative

- The "7-day sliding window" interpretation may differ from a reviewer's
  assumption of ISO calendar weeks — mitigated by documenting the choice
  in this ADR and in the README
- Two-pass approach (SQL query → JS post-processing) is slightly more
  complex than a single SQL query — but each part is simpler and more
  testable than a combined approach
- Assumes UTC timestamps throughout — no timezone conversion. Acceptable
  for the assessment; would need revisiting for a production system serving
  multiple time zones

## Pros and Cons of Alternatives

### ISO calendar week with pure SQL aggregation

- Good, because ISO weeks are a well-defined standard (Monday–Sunday)
- Good, because a single SQL query could produce the entire result
- Bad, because the user cannot pick arbitrary days — picking a Wednesday
  silently snaps to the surrounding Monday–Sunday, which may confuse CSMs
- Bad, because pure SQL top-3 ranking in SQLite requires subqueries or
  manual row-numbering since SQLite lacks `ROW_NUMBER() OVER(PARTITION BY ...)`
  in older versions
- Bad, because it removes user flexibility for no correctness gain

**Rejected because** it constrains user input without a corresponding benefit.

### Sliding window with pure JavaScript aggregation

- Good, because the SQL is trivial: `SELECT * FROM usage_events WHERE ...`
- Bad, because all grouping, counting, and ranking happens in JS — more
  code, harder to test, O(n) memory for the full event set
- Bad, because it does not scale — a district with 100K events would load
  them all into memory
- Bad, because it ignores the database's aggregation capabilities

**Rejected because** it moves work to the wrong layer and does not represent
a production-ready pattern.

## Production Considerations

In production, this decision would evolve:

- **Timezone handling:** Accept a timezone parameter or infer from the
  district's locale. Convert timestamps before filtering.
- **Pre-aggregation:** For large datasets, materialized views or nightly
  rollup tables would replace query-time aggregation.
- **ISO week option:** Offer both "trailing 7 days" and "ISO calendar week"
  as a user toggle, since different districts may expect different semantics.
- **Caching:** Cache results for (district_id, weekEndingDate) pairs since
  historical data does not change.
