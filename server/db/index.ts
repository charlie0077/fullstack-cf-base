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

const POOL_CONFIG = { min: 0, max: 1 } as const;

function createKnexInstance(connectionString: string): Knex {
  return knex({
    client: PGClient as any,
    connection: connectionString,
    pool: POOL_CONFIG,
  });
}

/**
 * Initializes the db connection per request.
 * - Dev: reuses a single Knex instance (stable DATABASE_URL)
 * - Production: creates a fresh instance per request because Hyperdrive
 *   manages connection pooling and stale TCP connections in Knex's pool
 *   cause unhandled errors (Cloudflare error 1101) that crash the Worker.
 */
export const dbMiddleware = createMiddleware<{
  Bindings: CloudflareBindings;
}>(async (c, next) => {
  if (isDev) {
    if (!db) db = createKnexInstance(process.env.DATABASE_URL!);
  } else {
    db = createKnexInstance(c.env.HYPERDRIVE.connectionString);
  }
  await next();
  if (!isDev) {
    await db.destroy();
  }
});
