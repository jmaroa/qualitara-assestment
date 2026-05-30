import "server-only";
import { cache } from "react";
import { createCallerFactory } from "./init";
import { appRouter } from "@/server/routers";
import { createTRPCContext } from "./init";

const createCaller = createCallerFactory(appRouter);

/**
 * Creates a server-side tRPC caller for use in React Server Components.
 * Cached per request via React's cache().
 */
export const getServerClient = cache(async () => {
  return createCaller(await createTRPCContext());
});
