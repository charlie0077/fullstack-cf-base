import { createMiddleware } from "hono/factory";
import knex, { type Knex } from "knex";
import { isDev } from "../config";

export let db: Knex;

function initDb(connectionString: string) {
  if (db) return;
  db = knex({ client: "pg", connection: connectionString });
}

/**
 * Initializes the db connection on the first request (no-op after that).
 * - Dev: uses DATABASE_URL from process.env (injected by Vite)
 * - Production: uses Hyperdrive connection string from Cloudflare binding
 *
 * Hyperdrive is a Cloudflare binding only accessible via the request context,
 * so initialization must happen in middleware rather than at module level.
 */
export const dbMiddleware = createMiddleware<{
  Bindings: CloudflareBindings;
}>(async (c, next) => {
  if (isDev) {
    initDb(process.env.DATABASE_URL!);
  } else {
    initDb(c.env.HYPERDRIVE.connectionString);
  }
  await next();
});
