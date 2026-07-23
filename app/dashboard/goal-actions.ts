"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { goals, goalDimensions } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { goalInputSchema, type GoalInput } from "@/lib/validations";

export type ActionResult = { ok: boolean; error?: string };

const VIEW_PATHS = [
  "/dashboard/hoy",
  "/dashboard/año",
  "/dashboard/trimestre",
];

function revalidateViews() {
  for (const p of VIEW_PATHS) revalidatePath(p);
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function createGoal(input: GoalInput): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "No autenticado" };

  const parsed = goalInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }
  const { horizonId, title, dimensionIds, parentGoalId } = parsed.data;

  const [created] = await db
    .insert(goals)
    .values({
      userId: user.id,
      horizonId,
      title,
      parentGoalId: parentGoalId ?? null,
    })
    .returning({ id: goals.id });

  if (created && dimensionIds.length > 0) {
    await db.insert(goalDimensions).values(
      dimensionIds.map((dimensionId) => ({
        goalId: created.id,
        dimensionId,
      })),
    );
  }

  revalidateViews();
  return { ok: true };
}

export async function toggleGoalComplete(
  goalId: string,
): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "No autenticado" };

  const [existing] = await db
    .select({ status: goals.status })
    .from(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, user.id)))
    .limit(1);
  if (!existing) return { ok: false, error: "No encontrado" };

  const nowCompleted = existing.status !== "completed";
  await db
    .update(goals)
    .set({
      status: nowCompleted ? "completed" : "active",
      completedAt: nowCompleted ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(and(eq(goals.id, goalId), eq(goals.userId, user.id)));

  revalidateViews();
  return { ok: true };
}

export async function updateGoalTitle(
  goalId: string,
  title: string,
): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "No autenticado" };
  const clean = title.trim();
  if (!clean) return { ok: false, error: "El título es obligatorio" };

  await db
    .update(goals)
    .set({ title: clean.slice(0, 200), updatedAt: new Date() })
    .where(and(eq(goals.id, goalId), eq(goals.userId, user.id)));

  revalidateViews();
  return { ok: true };
}

export async function deleteGoal(goalId: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "No autenticado" };

  await db
    .delete(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, user.id)));

  revalidateViews();
  return { ok: true };
}
