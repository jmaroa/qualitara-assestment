import { z } from "zod";

import type { DatabaseInstance } from "@/lib/db/connection";
import { getUsageEventsByDistrictAndDateRange, type UsageEventRow } from "@/lib/db/queries";

const weekEndingDateSchema = z.iso.date();

const weeklyDistrictSummaryInputSchema = z.object({
  districtId: z.string().min(1),
  weekEndingDate: weekEndingDateSchema,
});

export type TopEventType = {
  eventType: string;
  count: number;
};

export type SchoolWeeklySummary = {
  schoolId: string;
  activeTeachers: number;
  totalEvents: number;
  topEventTypes: TopEventType[];
};

export type WeeklyDistrictSummary = {
  districtId: string;
  weekStarting: string;
  weekEnding: string;
  summary: {
    totalActiveTeachers: number;
    totalEvents: number;
    topEventTypes: TopEventType[];
  };
  schools: SchoolWeeklySummary[];
};

type WeeklyDistrictSummaryInput = z.infer<typeof weeklyDistrictSummaryInputSchema>;

type WeekBoundaries = {
  weekStarting: string;
  weekEnding: string;
  weekEndingPlusOne: string;
};

type SchoolAccumulator = {
  schoolId: string;
  totalEvents: number;
  teacherIds: Set<string>;
  eventTypeCounts: Map<string, number>;
};

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

function formatIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toValidatedUtcDate(isoDate: string) {
  const parsedDate = weekEndingDateSchema.parse(isoDate);
  const [yearPart, monthPart, dayPart] = parsedDate.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);
  const utcDate = new Date(Date.UTC(year, month - 1, day));

  if (formatIsoDate(utcDate) !== parsedDate) {
    throw new Error("Invalid ISO date");
  }

  return utcDate;
}

function getTopEventTypes(eventTypeCounts: Map<string, number>) {
  return Array.from(eventTypeCounts.entries())
    .map(([eventType, count]) => ({ count, eventType }))
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return left.eventType.localeCompare(right.eventType);
    })
    .slice(0, 3);
}

function createEmptySummary(boundaries: WeekBoundaries, districtId: string): WeeklyDistrictSummary {
  return {
    districtId,
    schools: [],
    summary: {
      topEventTypes: [],
      totalActiveTeachers: 0,
      totalEvents: 0,
    },
    weekEnding: boundaries.weekEnding,
    weekStarting: boundaries.weekStarting,
  };
}

/**
 * Computes the inclusive 7-day reporting window from a week-ending date.
 *
 * @spec docs/adr/0002-aggregation-strategy-and-date-semantics.md
 */
export function getWeekBoundaries(weekEndingDate: string): WeekBoundaries {
  const weekEndingUtcDate = toValidatedUtcDate(weekEndingDate);
  const weekStartingUtcDate = new Date(weekEndingUtcDate.getTime() - 6 * DAY_IN_MILLISECONDS);
  const weekEndingPlusOneUtcDate = new Date(weekEndingUtcDate.getTime() + DAY_IN_MILLISECONDS);

  return {
    weekEnding: formatIsoDate(weekEndingUtcDate),
    weekEndingPlusOne: formatIsoDate(weekEndingPlusOneUtcDate),
    weekStarting: formatIsoDate(weekStartingUtcDate),
  };
}

/**
 * Aggregates the weekly district summary from filtered usage events.
 *
 * @spec openspec/changes/add-weekly-usage-summary-service/specs/weekly-district-summary/spec.md
 */
export function getWeeklyDistrictSummary(
  database: DatabaseInstance,
  input: WeeklyDistrictSummaryInput,
): WeeklyDistrictSummary {
  const parsedInput = weeklyDistrictSummaryInputSchema.parse(input);
  const boundaries = getWeekBoundaries(parsedInput.weekEndingDate);
  const usageEvents = getUsageEventsByDistrictAndDateRange(database, {
    districtId: parsedInput.districtId,
    weekEndingPlusOne: boundaries.weekEndingPlusOne,
    weekStarting: boundaries.weekStarting,
  });

  if (usageEvents.length === 0) {
    return createEmptySummary(boundaries, parsedInput.districtId);
  }

  const districtTeacherIds = new Set<string>();
  const districtEventTypeCounts = new Map<string, number>();
  const schoolAccumulators = new Map<string, SchoolAccumulator>();

  for (const usageEvent of usageEvents) {
    districtTeacherIds.add(usageEvent.teacherId);
    districtEventTypeCounts.set(
      usageEvent.eventType,
      (districtEventTypeCounts.get(usageEvent.eventType) ?? 0) + 1,
    );

    const schoolAccumulator = schoolAccumulators.get(usageEvent.schoolId) ?? {
      eventTypeCounts: new Map<string, number>(),
      schoolId: usageEvent.schoolId,
      teacherIds: new Set<string>(),
      totalEvents: 0,
    };

    schoolAccumulator.teacherIds.add(usageEvent.teacherId);
    schoolAccumulator.totalEvents += 1;
    schoolAccumulator.eventTypeCounts.set(
      usageEvent.eventType,
      (schoolAccumulator.eventTypeCounts.get(usageEvent.eventType) ?? 0) + 1,
    );
    schoolAccumulators.set(usageEvent.schoolId, schoolAccumulator);
  }

  return {
    districtId: parsedInput.districtId,
    schools: Array.from(schoolAccumulators.values())
      .map((schoolAccumulator) => ({
        activeTeachers: schoolAccumulator.teacherIds.size,
        schoolId: schoolAccumulator.schoolId,
        topEventTypes: getTopEventTypes(schoolAccumulator.eventTypeCounts),
        totalEvents: schoolAccumulator.totalEvents,
      }))
      .sort((left, right) => left.schoolId.localeCompare(right.schoolId)),
    summary: {
      topEventTypes: getTopEventTypes(districtEventTypeCounts),
      totalActiveTeachers: districtTeacherIds.size,
      totalEvents: usageEvents.length,
    },
    weekEnding: boundaries.weekEnding,
    weekStarting: boundaries.weekStarting,
  };
}
