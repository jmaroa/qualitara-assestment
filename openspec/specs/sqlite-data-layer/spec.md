# SQLite Data Layer

## Purpose

Zero-config local SQLite storage and deterministic synthetic usage data so reviewers can run the app and downstream features can query events by district and week without external dependencies.

## Requirements

### Requirement: Provide SQLite database connection
The system MUST provide a server-side SQLite connection using `better-sqlite3` that can open an on-disk database file for the application runtime and an in-memory database for tests.

#### Scenario: Open on-disk database
- **WHEN** the application starts with a configured SQLite file path
- **THEN** the system opens (or creates) the SQLite database at that path without requiring external services

#### Scenario: Open in-memory database for tests
- **WHEN** a unit test requests a database connection using the in-memory mode
- **THEN** the system returns an isolated in-memory SQLite database instance

### Requirement: Initialize schema for usage events
The system MUST be able to create the `usage_events` table and required indexes.

#### Scenario: Initialize schema in an empty database
- **WHEN** schema initialization is run against an empty database
- **THEN** the database contains a `usage_events` table with the expected columns and an index supporting district+timestamp queries

### Requirement: Seed deterministic synthetic usage data
The system MUST provide a seed script that generates synthetic `usage_events` data suitable for manual review and for downstream aggregation work.

#### Scenario: Seed creates expected scale
- **WHEN** the seed script is run
- **THEN** the database contains events spanning 4 weeks for 3 districts with 2–4 schools each, 5–15 teachers per school, and approximately 2000 total events

#### Scenario: Seed is deterministic
- **WHEN** the seed script is run multiple times with the same seed value/config
- **THEN** it produces the same dataset (same counts and identifiers)

### Requirement: Query usage events by district and date range
The system MUST provide query functions to retrieve usage events filtered by `district_id` and a date range that supports the weekly report semantics.

#### Scenario: Filter by district
- **WHEN** a caller requests events for a specific `district_id`
- **THEN** the query returns only events whose `district_id` matches the requested district

#### Scenario: Filter by inclusive 7-day window using exclusive upper bound
- **WHEN** a caller requests events for a `weekStarting` date and an exclusive `weekEndingPlusOne` date
- **THEN** the query returns events where `timestamp >= weekStarting` AND `timestamp < weekEndingPlusOne`
