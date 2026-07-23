import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { diagnostics, type Diagnostic } from "@/lib/db/schema";

export async function getLatestDiagnostic(
  userId: string,
): Promise<Diagnostic | null> {
  const rows = await db
    .select()
    .from(diagnostics)
    .where(eq(diagnostics.userId, userId))
    .orderBy(desc(diagnostics.takenAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function getDiagnosticHistory(
  userId: string,
): Promise<Diagnostic[]> {
  return db
    .select()
    .from(diagnostics)
    .where(and(eq(diagnostics.userId, userId)))
    .orderBy(desc(diagnostics.takenAt));
}
