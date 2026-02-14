import { createMiddleware } from "hono/factory";
import knex, { type Knex } from "knex";
import PGDialect from "knex/lib/dialects/postgres";
import pg from "pg";
import { isDev } from "../config";

// Knex loads pg via require('pg') which bundlers can't trace.
// Subclass the dialect to provide pg directly.
class PGClient extends PGDialect {
  _driver() {
    return pg;
  }
}

export let db: Knex;

function initDb(connectionString: string) {
  if (db) return;
  db = knex({ client: PGClient as any, connection: connectionString });
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
