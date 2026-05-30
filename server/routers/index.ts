import { createTRPCRouter } from "@/lib/trpc/init";
import { reportsRouter } from "@/server/routers/reports";

export const appRouter = createTRPCRouter({
  reports: reportsRouter,
});

export type AppRouter = typeof appRouter;
