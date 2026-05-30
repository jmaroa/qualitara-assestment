import { z } from "zod";

import type { DatabaseInstance } from "@/lib/db/connection";

const usageEventsByDistrictInputSchema = z.object({
  districtId: z.string().min(1),
  weekStarting: z.string().min(1),
  weekEndingPlusOne: z.string().min(1),
});

const usageEventRowSchema = z.object({
  id: z.number().int(),
  teacherId: z.string(),
  schoolId: z.string(),
  districtId: z.string(),
  eventType: z.string(),
  timestamp: z.string(),
});

const usageEventRowsSchema = z.array(usageEventRowSchema);

export type UsageEventRow = z.infer<typeof usageEventRowSchema>;

type GetUsageEventsByDistrictAndDateRangeInput = z.infer<
  typeof usageEventsByDistrictInputSchema
>;

/**
 * Returns usage events for a district inside the inclusive 7-day window
 * represented as [weekStarting, weekEndingPlusOne).
 *
 * @spec docs/adr/0002-aggregation-strategy-and-date-semantics.md
 */
export function getUsageEventsByDistrictAndDateRange(
  database: DatabaseInstance,
  input: GetUsageEventsByDistrictAndDateRangeInput,
): UsageEventRow[] {
  const parsedInput = usageEventsByDistrictInputSchema.parse(input);

  const rows = database
    .prepare(`
      SELECT
        id,
        teacher_id AS teacherId,
        school_id AS schoolId,
        district_id AS districtId,
        event_type AS eventType,
        timestamp
      FROM usage_events
      WHERE district_id = @districtId
        AND timestamp >= @weekStarting
        AND timestamp < @weekEndingPlusOne
      ORDER BY timestamp ASC, id ASC
    `)
    .all(parsedInput);

  return usageEventRowsSchema.parse(rows);
}
