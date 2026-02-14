import knex, { type Knex } from "knex";
import { isDev } from "../config";

let _db: Knex | null = null;

/**
 * Get a Knex instance.
 * - Local dev: connects directly via DATABASE_URL
 * - Production: uses Hyperdrive connection string from CF env
 */
export const getDb = (hyperdriveConnectionString?: string): Knex => {
  if (_db) return _db;

  _db = knex({
    client: "pg",
    connection: isDev
      ? process.env.DATABASE_URL
      : hyperdriveConnectionString,
  });

  return _db;
};
