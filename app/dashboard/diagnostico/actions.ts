"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { diagnostics } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { computeDiagnostic, isComplete } from "@/lib/scoring";

export type SaveDiagnosticResult = { ok: boolean; error?: string };

export async function saveDiagnostic(
  answers: Record<string, number>,
): Promise<SaveDiagnosticResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  if (!isComplete(answers)) {
    return { ok: false, error: "Responde todas las preguntas" };
  }

  const result = computeDiagnostic(answers);

  await db.insert(diagnostics).values({
    userId: user.id,
    scope: "personal",
    scores: result.scores,
    answers,
  });

  revalidatePath("/dashboard/diagnostico");
  revalidatePath("/dashboard/coherencia");
  return { ok: true };
}
