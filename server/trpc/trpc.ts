import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import logger from "../util/logger";

export type Context = {
  env: CloudflareBindings;
};

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

const logErrors = t.middleware(async ({ next, path }) => {
  try {
    return await next();
  } catch (err) {
    logger.error("trpc error", { path, error: (err as Error).message });
    throw err;
  }
});

export const router = t.router;
export const publicProcedure = t.procedure.use(logErrors);
