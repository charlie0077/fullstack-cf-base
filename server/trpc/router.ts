import { z } from "zod/v4";
import { router, publicProcedure } from "./trpc";
import { db } from "../db";

export const appRouter = router({
  hello: publicProcedure
    .input(z.object({ name: z.optional(z.string()) }))
    .query(({ input }) => {
      const name = input.name ?? "tRPC";
      return { message: `Hello from ${name}!`, timestamp: Date.now() };
    }),

  users: router({
    list: publicProcedure.query(async () => {
      return db("users")
        .select("id", "email", "name", "created_at")
        .orderBy("created_at", "desc");
    }),

    create: publicProcedure
      .input(
        z.object({
          email: z.email(),
          name: z.string().min(1),
        }),
      )
      .mutation(async ({ input }) => {
        const id = crypto.randomUUID();
        const [user] = await db("users")
          .insert({ id, email: input.email, name: input.name })
          .returning(["id", "email", "name", "created_at"]);
        return user;
      }),
  }),
});

export type AppRouter = typeof appRouter;
