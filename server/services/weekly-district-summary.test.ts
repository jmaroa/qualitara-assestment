// @vitest-environment node

import { describe, expect, it } from "vitest";

import { createDatabase, type DatabaseInstance } from "@/lib/db/connection";
import { initializeSchema } from "@/lib/db/schema";
import {
  getWeekBoundaries,
  getWeeklyDistrictSummary,
} from "@/server/services/weekly-district-summary";

type InsertUsageEventInput = {
  teacherId: string;
  schoolId: string;
  districtId: string;
  eventType: string;
  timestamp: string;
};

function insertUsageEvent(database: DatabaseInstance, values: InsertUsageEventInput) {
  database
    .prepare(`
      INSERT INTO usage_events (teacher_id, school_id, district_id, event_type, timestamp)
      VALUES (@teacherId, @schoolId, @districtId, @eventType, @timestamp)
    `)
    .run(values);
}

describe("getWeekBoundaries", () => {
  it("returns a 7-day inclusive window ending on the given date", () => {
    // Arrange
    const weekEndingDate = "2026-05-30";

    // Act
    const result = getWeekBoundaries(weekEndingDate);

    // Assert
    expect(result).toEqual({
      weekEnding: "2026-05-30",
      weekEndingPlusOne: "2026-05-31",
      weekStarting: "2026-05-24",
    });
  });

  it("handles month boundaries correctly", () => {
    // Arrange
    const weekEndingDate = "2026-03-01";

    // Act
    const result = getWeekBoundaries(weekEndingDate);

    // Assert
    expect(result).toEqual({
      weekEnding: "2026-03-01",
      weekEndingPlusOne: "2026-03-02",
      weekStarting: "2026-02-23",
    });
  });
});

describe("getWeeklyDistrictSummary", () => {
  it("aggregates district totals, school totals, and top event types", () => {
    // Arrange
    const database = createDatabase({ inMemory: true });
    initializeSchema(database);
    insertUsageEvent(database, {
      teacherId: "teacher-1",
      schoolId: "school-a",
      districtId: "district-1",
      eventType: "login",
      timestamp: "2026-05-24T08:00:00.000Z",
    });
    insertUsageEvent(database, {
      teacherId: "teacher-1",
      schoolId: "school-b",
      districtId: "district-1",
      eventType: "assignment_view",
      timestamp: "2026-05-25T08:00:00.000Z",
    });
    insertUsageEvent(database, {
      teacherId: "teacher-2",
      schoolId: "school-a",
      districtId: "district-1",
      eventType: "assignment_view",
      timestamp: "2026-05-26T08:00:00.000Z",
    });
    insertUsageEvent(database, {
      teacherId: "teacher-3",
      schoolId: "school-a",
      districtId: "district-1",
      eventType: "message_sent",
      timestamp: "2026-05-27T08:00:00.000Z",
    });
    insertUsageEvent(database, {
      teacherId: "teacher-4",
      schoolId: "school-c",
      districtId: "district-2",
      eventType: "login",
      timestamp: "2026-05-28T08:00:00.000Z",
    });
    insertUsageEvent(database, {
      teacherId: "teacher-5",
      schoolId: "school-a",
      districtId: "district-1",
      eventType: "quiz_start",
      timestamp: "2026-05-31T00:00:00.000Z",
    });

    // Act
    const result = getWeeklyDistrictSummary(database, {
      districtId: "district-1",
      weekEndingDate: "2026-05-30",
    });

    // Assert
    expect(result).toEqual({
      districtId: "district-1",
      schools: [
        {
          activeTeachers: 3,
          schoolId: "school-a",
          topEventTypes: [
            { count: 1, eventType: "assignment_view" },
            { count: 1, eventType: "login" },
            { count: 1, eventType: "message_sent" },
          ],
          totalEvents: 3,
        },
        {
          activeTeachers: 1,
          schoolId: "school-b",
          topEventTypes: [{ count: 1, eventType: "assignment_view" }],
          totalEvents: 1,
        },
      ],
      summary: {
        topEventTypes: [
          { count: 2, eventType: "assignment_view" },
          { count: 1, eventType: "login" },
          { count: 1, eventType: "message_sent" },
        ],
        totalActiveTeachers: 3,
        totalEvents: 4,
      },
      weekEnding: "2026-05-30",
      weekStarting: "2026-05-24",
    });

    database.close();
  });

  it("returns zero totals for a district with no events", () => {
    // Arrange
    const database = createDatabase({ inMemory: true });
    initializeSchema(database);

    // Act
    const result = getWeeklyDistrictSummary(database, {
      districtId: "district-missing",
      weekEndingDate: "2026-05-30",
    });

    // Assert
    expect(result).toEqual({
      districtId: "district-missing",
      schools: [],
      summary: {
        topEventTypes: [],
        totalActiveTeachers: 0,
        totalEvents: 0,
      },
      weekEnding: "2026-05-30",
      weekStarting: "2026-05-24",
    });

    database.close();
  });
});
