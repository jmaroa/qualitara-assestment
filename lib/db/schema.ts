import type { DatabaseInstance } from "@/lib/db/connection";

/**
 * Creates the SQLite schema used for weekly usage reporting.
 *
 * @spec docs/technical-design.md#42-data-model
 */
export function initializeSchema(database: DatabaseInstance) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS usage_events (
      id INTEGER PRIMARY KEY,
      teacher_id TEXT NOT NULL,
      school_id TEXT NOT NULL,
      district_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS usage_events_district_timestamp_idx
      ON usage_events (district_id, timestamp);
  `);
}
