import { z } from "zod/v4";
import { router, publicProcedure } from "./trpc";

export const appRouter = router({
  hello: publicProcedure
    .input(z.object({ name: z.optional(z.string()) }))
    .query(({ input }) => {
      const name = input.name ?? "tRPC";
      return { message: `Hello from ${name}!`, timestamp: Date.now() };
    }),
});

export type AppRouter = typeof appRouter;
