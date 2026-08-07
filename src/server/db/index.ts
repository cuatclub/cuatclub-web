import { drizzle } from "drizzle-orm/postgres-js";
import type { PostgresJsTransaction } from "drizzle-orm/postgres-js";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import postgres from "postgres";

import { env } from "@/config/env";
import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn = globalForDb.conn ?? postgres(env.DATABASE_URL);
if (env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema });

// Common type for both the top-level `db` and a transaction's `tx` — repositories
// accept this so they can run standalone or inside a UnitOfWork.run() block.
export type DbClient =
  | typeof db
  | PostgresJsTransaction<typeof schema, ExtractTablesWithRelations<typeof schema>>;
