"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { norte } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { norteSchema, type NorteInput } from "@/lib/validations";

export type SaveNorteResult = { ok: boolean; error?: string };

export async function saveNorte(input: NorteInput): Promise<SaveNorteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  const parsed = norteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const { proposito, valores, vision75 } = parsed.data;

  // Upsert: one norte row per user (user_id is unique).
  await db
    .insert(norte)
    .values({
      userId: user.id,
      proposito,
      valores,
      vision75,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: norte.userId,
      set: {
        proposito,
        valores,
        vision75,
        updatedAt: new Date(),
      },
    });

  revalidatePath("/dashboard/norte");
  return { ok: true };
}
