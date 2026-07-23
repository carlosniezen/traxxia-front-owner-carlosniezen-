import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Lazy Drizzle singleton over Supabase Postgres (postgres-js driver).
 * postgres-js does not open a connection until the first query, so importing
 * this module is safe at build time even when DATABASE_URL is unset.
 */
const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof postgres> | undefined;
};

const connectionString = process.env.DATABASE_URL ?? "";

const client =
  globalForDb.client ??
  postgres(connectionString, { prepare: false });

if (process.env.NODE_ENV !== "production") globalForDb.client = client;

export const db = drizzle(client, { schema });
export { schema };
