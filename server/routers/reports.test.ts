// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createDatabase, type DatabaseInstance } from "@/lib/db/connection";
import { initializeSchema } from "@/lib/db/schema";
import { createCallerFactory } from "@/lib/trpc/init";
import { reportsRouter } from "@/server/routers/reports";

type InsertUsageEventInput = {
  teacherId: string;
  schoolId: string;
  districtId: string;
  eventType: string;
  timestamp: string;
};

let database: DatabaseInstance;

vi.mock("@/lib/db/connection", async () => {
  const actualModule = await vi.importActual<typeof import("@/lib/db/connection")>(
    "@/lib/db/connection",
  );

  return {
    ...actualModule,
    getDatabase: () => database,
  };
});

function insertUsageEvent(databaseInstance: DatabaseInstance, values: InsertUsageEventInput) {
  databaseInstance
    .prepare(`
      INSERT INTO usage_events (teacher_id, school_id, district_id, event_type, timestamp)
      VALUES (@teacherId, @schoolId, @districtId, @eventType, @timestamp)
    `)
    .run(values);
}

beforeEach(() => {
  database = createDatabase({ inMemory: true });
  initializeSchema(database);
});

afterEach(() => {
  database.close();
});

describe("reportsRouter", () => {
  it("rejects invalid input", async () => {
    // Arrange
    const createCaller = createCallerFactory(reportsRouter);
    const caller = createCaller({});

    // Act
    const result = caller.weeklyDistrictSummary({
      districtId: "",
      weekEndingDate: "not-a-date",
    });

    // Assert
    await expect(result).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  it("returns the weekly district summary shape for valid input", async () => {
    // Arrange
    insertUsageEvent(database, {
      teacherId: "teacher-1",
      schoolId: "school-a",
      districtId: "district-1",
      eventType: "login",
      timestamp: "2026-05-24T08:00:00.000Z",
    });
    const createCaller = createCallerFactory(reportsRouter);
    const caller = createCaller({});

    // Act
    const result = await caller.weeklyDistrictSummary({
      districtId: "district-1",
      weekEndingDate: "2026-05-30",
    });

    // Assert
    expect(result).toEqual({
      districtId: "district-1",
      schools: [
        {
          activeTeachers: 1,
          schoolId: "school-a",
          topEventTypes: [{ count: 1, eventType: "login" }],
          totalEvents: 1,
        },
      ],
      summary: {
        topEventTypes: [{ count: 1, eventType: "login" }],
        totalActiveTeachers: 1,
        totalEvents: 1,
      },
      weekEnding: "2026-05-30",
      weekStarting: "2026-05-24",
    });
  });
});
