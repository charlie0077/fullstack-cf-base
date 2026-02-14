import { z } from "zod/v4";
import { publicProcedure } from "../../trpc/trpc";

export const helloRouter = publicProcedure
  .input(z.object({ name: z.optional(z.string()) }))
  .query(({ input }) => {
    const name = input.name ?? "tRPC";
    return { message: `Hello from ${name}!`, timestamp: Date.now() };
  });
