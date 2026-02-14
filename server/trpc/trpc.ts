import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import logger from "../util/logger";
import type { JWTPayload } from "../lib/auth";

export type Context = {
  env: CloudflareBindings;
  user: JWTPayload | null;
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

const requireAuth = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const router = t.router;
export const publicProcedure = t.procedure.use(logErrors);
export const protectedProcedure = t.procedure.use(logErrors).use(requireAuth);
