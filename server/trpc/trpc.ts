import { initTRPC } from "@trpc/server";
import superjson from "superjson";

export type Context = {
  env: CloudflareBindings;
};

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
