import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import { env } from "../env.ts";

export type DatabaseInstance = Database.Database;

type CreateDatabaseOptions = {
  path?: string;
  inMemory?: boolean;
};

let runtimeDatabase: DatabaseInstance | null = null;

/**
 * Opens a SQLite database for the app runtime or for isolated tests.
 *
 * @spec docs/adr/0001-sqlite-with-better-sqlite3.md
 */
export function createDatabase(options?: CreateDatabaseOptions): DatabaseInstance {
  if (options?.inMemory) {
    return new Database(":memory:");
  }

  const databasePath = options?.path ?? env.DATABASE_PATH;
  mkdirSync(dirname(databasePath), { recursive: true });

  return new Database(databasePath);
}

/**
 * Returns the singleton runtime database for app code.
 *
 * @spec docs/adr/0001-sqlite-with-better-sqlite3.md
 */
export function getDatabase(): DatabaseInstance {
  if (runtimeDatabase) {
    return runtimeDatabase;
  }

  runtimeDatabase = createDatabase();
  return runtimeDatabase;
}

export function closeRuntimeDatabase() {
  if (!runtimeDatabase) {
    return;
  }

  runtimeDatabase.close();
  runtimeDatabase = null;
}
