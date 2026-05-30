import { initTRPC } from "@trpc/server";
import superjson from "superjson";

export interface TRPCContext {
  // Extend as needed when adding auth, DB, etc.
}

export const createTRPCContext = async (): Promise<TRPCContext> => {
  return {};
};

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

// ─── Middleware ─────────────────────────────────────────────────────────────

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();
  const result = await next();
  const ms = Date.now() - start;
  if (ms > 500) console.warn(`[tRPC] slow (${ms}ms): ${path}`);
  return result;
});

// ─── Procedures ─────────────────────────────────────────────────────────────

export const createTRPCRouter = t.router;
export const mergeRouters = t.mergeRouters;
export const createCallerFactory = t.createCallerFactory;

/** No auth required */
export const publicProcedure = t.procedure.use(timingMiddleware);
