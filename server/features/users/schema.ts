import { z } from "zod/v4";

export const createUserInput = z.object({
  email: z.email(),
  name: z.string().min(1),
});

export type CreateUserInput = z.infer<typeof createUserInput>;
