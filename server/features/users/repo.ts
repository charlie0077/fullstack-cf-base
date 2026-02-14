import { db } from "../../db";

const SELECTED_FIELDS = ["id", "email", "name", "created_at"] as const;

export const findAll = () =>
  db("users").select(...SELECTED_FIELDS).orderBy("created_at", "desc");

export const findByEmail = (email: string) =>
  db("users").where({ email }).first();

export const insert = (user: { id: string; email: string; name: string }) =>
  db("users").insert(user).returning([...SELECTED_FIELDS]);
