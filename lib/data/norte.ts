import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { norte, type Norte } from "@/lib/db/schema";

/**
 * Drizzle connects as the Postgres owner, which bypasses RLS — so every query
 * MUST be scoped by userId in code. The caller obtains userId from the
 * authenticated Supabase session.
 */
export async function getNorteForUser(userId: string): Promise<Norte | null> {
  const rows = await db
    .select()
    .from(norte)
    .where(eq(norte.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}
