import { TRPCError } from "@trpc/server";
import * as UserRepo from "./repo";
import type { CreateUserInput } from "./schema";

export const list = () => UserRepo.findAll();

export const create = async (input: CreateUserInput) => {
  const existing = await UserRepo.findByEmail(input.email);
  if (existing) {
    throw new TRPCError({ code: "CONFLICT", message: "Email already taken" });
  }

  const id = crypto.randomUUID();
  const [user] = await UserRepo.insert({ id, ...input });
  return user;
};
