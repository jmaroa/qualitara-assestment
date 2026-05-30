import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { getDatabase } from "@/lib/db/connection";
import { createTRPCRouter, publicProcedure } from "@/lib/trpc/init";
import { getWeeklyDistrictSummary } from "@/server/services/weekly-district-summary";

const weeklyDistrictSummaryInputSchema = z.object({
  districtId: z.string().min(1),
  weekEndingDate: z.iso.date(),
});

/**
 * Returns the weekly per-school usage summary for a district.
 *
 * @spec openspec/changes/add-weekly-usage-summary-service/specs/weekly-district-summary/spec.md
 */
export const reportsRouter = createTRPCRouter({
  weeklyDistrictSummary: publicProcedure
    .input(weeklyDistrictSummaryInputSchema)
    .query(async ({ input }) => {
      try {
        return getWeeklyDistrictSummary(getDatabase(), input);
      } catch (error: unknown) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          cause: error,
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate weekly district summary",
        });
      }
    }),
});
