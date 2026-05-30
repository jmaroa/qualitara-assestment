import { createTRPCRouter } from "@/lib/trpc/init";

export const appRouter = createTRPCRouter({
  // Register routers here as they are created
});

export type AppRouter = typeof appRouter;
