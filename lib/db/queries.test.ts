// @vitest-environment node

import { afterEach, describe, expect, it } from "vitest";

import { createDatabase, type DatabaseInstance } from "@/lib/db/connection";
import { getUsageEventsByDistrictAndDateRange } from "@/lib/db/queries";
import { initializeSchema } from "@/lib/db/schema";

function insertUsageEvent(database: DatabaseInstance, values: {
  teacherId: string;
  schoolId: string;
  districtId: string;
  eventType: string;
  timestamp: string;
}) {
  database
    .prepare(`
      INSERT INTO usage_events (teacher_id, school_id, district_id, event_type, timestamp)
      VALUES (@teacherId, @schoolId, @districtId, @eventType, @timestamp)
    `)
    .run(values);
}

afterEach(() => {
  // no shared state between tests
});

describe("initializeSchema", () => {
  it("creates the usage_events table and district/timestamp index", () => {
    // Arrange
    const database = createDatabase({ inMemory: true });

    // Act
    initializeSchema(database);
    const tableRows = database
      .prepare(`
        SELECT name
        FROM sqlite_master
        WHERE type = 'table' AND name = 'usage_events'
      `)
      .all();
    const indexRows = database
      .prepare(`
        SELECT name
        FROM sqlite_master
        WHERE type = 'index' AND name = 'usage_events_district_timestamp_idx'
      `)
      .all();

    // Assert
    expect({ indexRows, tableRows }).toEqual({
      indexRows: [{ name: "usage_events_district_timestamp_idx" }],
      tableRows: [{ name: "usage_events" }],
    });

    database.close();
  });
});

describe("getUsageEventsByDistrictAndDateRange", () => {
  it("returns only events for the requested district", () => {
    // Arrange
    const database = createDatabase({ inMemory: true });
    initializeSchema(database);
    insertUsageEvent(database, {
      teacherId: "teacher-1",
      schoolId: "school-1",
      districtId: "district-1",
      eventType: "login",
      timestamp: "2026-05-24T10:00:00.000Z",
    });
    insertUsageEvent(database, {
      teacherId: "teacher-2",
      schoolId: "school-2",
      districtId: "district-2",
      eventType: "assignment_view",
      timestamp: "2026-05-25T11:00:00.000Z",
    });

    // Act
    const result = getUsageEventsByDistrictAndDateRange(database, {
      districtId: "district-1",
      weekStarting: "2026-05-24",
      weekEndingPlusOne: "2026-05-31",
    });

    // Assert
    expect(result).toEqual([
      {
        districtId: "district-1",
        eventType: "login",
        id: 1,
        schoolId: "school-1",
        teacherId: "teacher-1",
        timestamp: "2026-05-24T10:00:00.000Z",
      },
    ]);

    database.close();
  });

  it("excludes events on the exclusive upper bound", () => {
    // Arrange
    const database = createDatabase({ inMemory: true });
    initializeSchema(database);
    insertUsageEvent(database, {
      teacherId: "teacher-1",
      schoolId: "school-1",
      districtId: "district-1",
      eventType: "login",
      timestamp: "2026-05-30T23:59:59.999Z",
    });
    insertUsageEvent(database, {
      teacherId: "teacher-2",
      schoolId: "school-1",
      districtId: "district-1",
      eventType: "assignment_view",
      timestamp: "2026-05-31T00:00:00.000Z",
    });

    // Act
    const result = getUsageEventsByDistrictAndDateRange(database, {
      districtId: "district-1",
      weekStarting: "2026-05-24",
      weekEndingPlusOne: "2026-05-31",
    });

    // Assert
    expect(result.map((event) => event.id)).toEqual([1]);

    database.close();
  });
});
