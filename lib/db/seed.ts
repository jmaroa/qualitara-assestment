import { mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { DatabaseInstance } from "./connection.ts";
import { createDatabase } from "./connection.ts";
import { env } from "../env.ts";
import { initializeSchema } from "./schema.ts";

type Teacher = {
  teacherId: string;
  schoolId: string;
  districtId: string;
};

type SyntheticUsageEvent = {
  teacherId: string;
  schoolId: string;
  districtId: string;
  eventType: string;
  timestamp: string;
};

type SeedSummary = {
  totalEvents: number;
  districtCount: number;
  schoolCount: number;
  teacherCount: number;
};

type SyntheticSeedDataset = {
  events: SyntheticUsageEvent[];
  summary: SeedSummary;
};

const EVENT_TYPES = [
  "login",
  "lesson_view",
  "assignment_view",
  "assignment_complete",
  "message_sent",
] as const;

const DISTRICT_COUNT = 3;
const TOTAL_EVENTS = 2000;
const TOTAL_DAYS = 28;
const SEED = 20260530;
const BASE_TIMESTAMP = Date.UTC(2026, 4, 3, 0, 0, 0, 0);

function createPseudoRandom(seed: number) {
  let state = seed;

  return function nextRandom() {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInt(nextRandom: () => number, minimum: number, maximum: number) {
  return Math.floor(nextRandom() * (maximum - minimum + 1)) + minimum;
}

function buildTeachers(nextRandom: () => number): Teacher[] {
  const teachers: Teacher[] = [];

  for (let districtNumber = 1; districtNumber <= DISTRICT_COUNT; districtNumber += 1) {
    const districtId = `district-${districtNumber}`;
    const schoolCount = randomInt(nextRandom, 2, 4);

    for (let schoolNumber = 1; schoolNumber <= schoolCount; schoolNumber += 1) {
      const schoolId = `school-${districtNumber}-${schoolNumber}`;
      const teacherCount = randomInt(nextRandom, 5, 15);

      for (
        let teacherNumber = 1;
        teacherNumber <= teacherCount;
        teacherNumber += 1
      ) {
        teachers.push({
          districtId,
          schoolId,
          teacherId: `teacher-${districtNumber}-${schoolNumber}-${teacherNumber
            .toString()
            .padStart(2, "0")}`,
        });
      }
    }
  }

  return teachers;
}

function buildSyntheticUsageEvents(teachers: Teacher[], nextRandom: () => number) {
  const events: SyntheticUsageEvent[] = [];

  for (let index = 0; index < TOTAL_EVENTS; index += 1) {
    const teacher = teachers[index % teachers.length];
    const dayOffset = index % TOTAL_DAYS;
    const hour = randomInt(nextRandom, 0, 23);
    const minute = randomInt(nextRandom, 0, 59);
    const second = randomInt(nextRandom, 0, 59);
    const millisecond = randomInt(nextRandom, 0, 999);
    const timestamp = new Date(
      BASE_TIMESTAMP +
        dayOffset * 24 * 60 * 60 * 1000 +
        hour * 60 * 60 * 1000 +
        minute * 60 * 1000 +
        second * 1000 +
        millisecond,
    ).toISOString();

    events.push({
      districtId: teacher.districtId,
      eventType: EVENT_TYPES[randomInt(nextRandom, 0, EVENT_TYPES.length - 1)],
      schoolId: teacher.schoolId,
      teacherId: teacher.teacherId,
      timestamp,
    });
  }

  events.sort((left, right) => left.timestamp.localeCompare(right.timestamp));

  return events;
}

/**
 * Generates a deterministic synthetic dataset for local review and tests.
 *
 * @spec openspec/changes/setup-sqlite-better-sqlite3/specs/sqlite-data-layer/spec.md
 */
export function generateSyntheticSeedDataset(): SyntheticSeedDataset {
  const nextRandom = createPseudoRandom(SEED);
  const teachers = buildTeachers(nextRandom);
  const events = buildSyntheticUsageEvents(teachers, nextRandom);
  const schoolIds = new Set(teachers.map((teacher) => teacher.schoolId));
  const districtIds = new Set(teachers.map((teacher) => teacher.districtId));

  return {
    events,
    summary: {
      districtCount: districtIds.size,
      schoolCount: schoolIds.size,
      teacherCount: teachers.length,
      totalEvents: events.length,
    },
  };
}

export function insertSyntheticUsageEvents(
  database: DatabaseInstance,
  events: SyntheticUsageEvent[],
) {
  const insertUsageEvent = database.prepare(`
    INSERT INTO usage_events (teacher_id, school_id, district_id, event_type, timestamp)
    VALUES (@teacherId, @schoolId, @districtId, @eventType, @timestamp)
  `);

  const insertMany = database.transaction((rows: SyntheticUsageEvent[]) => {
    for (const row of rows) {
      insertUsageEvent.run(row);
    }
  });

  insertMany(events);
}

/**
 * Recreates the SQLite file and fills it with the deterministic synthetic dataset.
 *
 * @spec openspec/changes/setup-sqlite-better-sqlite3/specs/sqlite-data-layer/spec.md
 */
export function seedDatabaseFile(databasePath = env.DATABASE_PATH): SeedSummary {
  rmSync(databasePath, { force: true });
  mkdirSync(dirname(databasePath), { recursive: true });

  const database = createDatabase({ path: databasePath });
  initializeSchema(database);

  const dataset = generateSyntheticSeedDataset();
  insertSyntheticUsageEvents(database, dataset.events);
  database.close();

  return dataset.summary;
}

async function main() {
  const summary = seedDatabaseFile();

  console.log(
    `Seeded ${summary.totalEvents} events across ${summary.districtCount} districts, ${summary.schoolCount} schools, and ${summary.teacherCount} teachers into ${env.DATABASE_PATH}`,
  );
}

const isDirectExecution =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
