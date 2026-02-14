import { router, publicProcedure } from "../../trpc/trpc";
import * as UserService from "./service";
import { createUserInput } from "./schema";

export const usersRouter = router({
  list: publicProcedure.query(() => UserService.list()),

  create: publicProcedure
    .input(createUserInput)
    .mutation(({ input }) => UserService.create(input)),
});
