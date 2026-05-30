# ADR 0001 — Use SQLite with better-sqlite3 for Data Storage

## Status

Accepted

## Date

2026-05-30

## Context

The application reads teacher usage events and exposes a weekly per-school
summary endpoint. The assessment allows "a provided CSV or seeded database"
as the data source.

The reviewer will clone the repo and run the app locally. Any external
dependency (Docker, cloud database, manual setup) adds friction to that
process. The dataset is small — thousands of events across a handful of
districts and schools. The app is read-only after the initial seed.

We need a data store that supports SQL aggregation (GROUP BY, COUNT,
DISTINCT), requires zero setup from the reviewer, and represents a
defensible architectural decision for the assessment scope.

## Decision Drivers

- Reviewer setup friction (clone → install → run, nothing else)
- SQL aggregation capability for the summary query
- Assessment scope: read-only, small dataset, single user
- Clear production migration path to PostgreSQL
- Minimal dependency footprint

## Considered Options

1. SQLite via `better-sqlite3` with raw SQL
2. PostgreSQL via Docker Compose
3. Drizzle ORM + SQLite
4. Raw CSV parsing per request (no database)

## Decision

We will use SQLite via `better-sqlite3` with raw SQL queries. No ORM.

The database is a single `.sqlite` file created by a seed script
(`pnpm db:seed`). Queries use parameterized SQL strings executed through
the synchronous `better-sqlite3` API.

## Consequences

### Positive

- Zero external dependencies for the reviewer — no Docker, no cloud DB,
  no connection string configuration
- Synchronous API eliminates async complexity in the data layer
- Full SQL support for the aggregation pattern (GROUP BY, COUNT, DISTINCT)
- Single file is portable and deterministic — seed produces identical state
- `better-sqlite3` is the fastest SQLite binding for Node.js

### Negative

- No concurrent write support — acceptable because the app is read-only
  after seeding
- Raw SQL has no compile-time type checking — mitigated by TypeScript types
  on query results and tests on the aggregation output
- Production would require a full migration to PostgreSQL — the SQL dialect
  differences (e.g., TEXT vs TIMESTAMPTZ, AUTOINCREMENT vs SERIAL) mean the
  queries are not directly portable

## Pros and Cons of Alternatives

### PostgreSQL via Docker Compose

- Good, because it matches a production environment
- Good, because it supports TIMESTAMPTZ and richer SQL features
- Bad, because the reviewer must have Docker installed and running
- Bad, because it adds a `docker-compose.yml`, health checks, and a
  connection string to the setup process
- Bad, because it over-engineers a take-home assessment with a small dataset

**Rejected because** reviewer setup friction outweighs production fidelity
for an assessment.

### Drizzle ORM + SQLite

- Good, because it provides type-safe query building
- Good, because it has a SQLite driver and schema definition DSL
- Neutral, because the schema is a single table — the ORM adds no
  relationship or migration value
- Bad, because it introduces a schema definition layer, a generate step,
  and a dependency for a single-table read-only app
- Bad, because the abstraction hides the SQL, making queries harder to
  explain line-by-line in the walkthrough

**Rejected because** the complexity is not earned for a single-table app.

### Raw CSV parsing per request

- Good, because the data source is literally a file — no database at all
- Bad, because there is no query language — all filtering, grouping, and
  counting must be implemented in JavaScript
- Bad, because every request re-parses the entire file
- Bad, because it is not a pattern that translates to production
- Bad, because it makes testing the aggregation logic harder to isolate

**Rejected because** it sacrifices query capability and testability.

## Production Considerations

In production, this decision would change:

- **Data store:** PostgreSQL (Neon, RDS, or equivalent managed service)
- **Schema:** Normalized tables (teachers, schools, districts, events) with
  foreign keys and TIMESTAMPTZ columns
- **Queries:** Adapted for PostgreSQL dialect, potentially with materialized
  views for repeated report queries
- **Connection:** Connection pooling, environment-variable-based configuration
- **Migrations:** Version-controlled migration files (Prisma Migrate or similar)
