import { router, protectedProcedure } from "../../trpc/trpc";
import * as UserService from "./service";
import { createUserInput } from "./schema";

export const usersRouter = router({
  list: protectedProcedure.query(() => UserService.list()),

  create: protectedProcedure
    .input(createUserInput)
    .mutation(({ input }) => UserService.create(input)),
});
