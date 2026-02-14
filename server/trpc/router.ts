import { router } from "./trpc";
import { helloRouter } from "../features/hello/router";
import { usersRouter } from "../features/users/router";

export const appRouter = router({
  hello: helloRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
