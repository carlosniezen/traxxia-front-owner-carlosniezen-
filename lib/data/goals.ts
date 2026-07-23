import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  goals,
  goalDimensions,
  horizons,
  type Goal,
} from "@/lib/db/schema";
import type { HorizonKind } from "@/lib/horizons";

export type EnrichedGoal = Goal & { dimensionIds: string[] };

async function attachDimensions(rows: Goal[]): Promise<EnrichedGoal[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((g) => g.id);
  const links = await db
    .select()
    .from(goalDimensions)
    .where(inArray(goalDimensions.goalId, ids));

  const byGoal = new Map<string, string[]>();
  for (const link of links) {
    const arr = byGoal.get(link.goalId) ?? [];
    arr.push(link.dimensionId);
    byGoal.set(link.goalId, arr);
  }
  return rows.map((g) => ({ ...g, dimensionIds: byGoal.get(g.id) ?? [] }));
}

/** Goals attached to a horizon (scoped by user), oldest first, enriched. */
export async function getGoalsByHorizon(
  userId: string,
  horizonId: string,
): Promise<EnrichedGoal[]> {
  const rows = await db
    .select()
    .from(goals)
    .where(and(eq(goals.userId, userId), eq(goals.horizonId, horizonId)));
  rows.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  return attachDimensions(rows);
}

/** Child-completion progress for a set of parent goals. */
export async function getChildProgress(
  userId: string,
  parentIds: string[],
): Promise<Map<string, { total: number; completed: number }>> {
  const out = new Map<string, { total: number; completed: number }>();
  if (parentIds.length === 0) return out;

  const children = await db
    .select()
    .from(goals)
    .where(
      and(eq(goals.userId, userId), inArray(goals.parentGoalId, parentIds)),
    );

  for (const c of children) {
    if (!c.parentGoalId) continue;
    const entry = out.get(c.parentGoalId) ?? { total: 0, completed: 0 };
    entry.total += 1;
    if (c.status === "completed") entry.completed += 1;
    out.set(c.parentGoalId, entry);
  }
  return out;
}

/** Walks the parent chain upward from a goal (immediate parent first). */
export async function getGoalChain(
  userId: string,
  goalId: string,
): Promise<EnrichedGoal[]> {
  const chain: Goal[] = [];
  const seen = new Set<string>([goalId]);
  let current = await db
    .select()
    .from(goals)
    .where(and(eq(goals.userId, userId), eq(goals.id, goalId)))
    .limit(1);

  let parentId = current[0]?.parentGoalId ?? null;
  while (parentId && !seen.has(parentId)) {
    seen.add(parentId);
    const parent = await db
      .select()
      .from(goals)
      .where(and(eq(goals.userId, userId), eq(goals.id, parentId)))
      .limit(1);
    if (!parent[0]) break;
    chain.push(parent[0]);
    parentId = parent[0].parentGoalId ?? null;
  }
  return attachDimensions(chain);
}

/** Orphan goals: active goals in sub-annual horizons with no parent link. */
export type OrphanGoal = {
  id: string;
  title: string;
  kind: HorizonKind;
};

export async function getOrphanGoals(userId: string): Promise<OrphanGoal[]> {
  const rows = await db
    .select({
      id: goals.id,
      title: goals.title,
      kind: horizons.kind,
    })
    .from(goals)
    .innerJoin(horizons, eq(goals.horizonId, horizons.id))
    .where(
      and(
        eq(goals.userId, userId),
        isNull(goals.parentGoalId),
        eq(goals.status, "active"),
        inArray(horizons.kind, ["day", "week", "month", "quarter"]),
      ),
    );
  return rows;
}

/** All active goals with their horizon kind — used by the master Horizontes view. */
export type GraphGoal = EnrichedGoal & { kind: HorizonKind };

export async function getGoalGraph(userId: string): Promise<GraphGoal[]> {
  const rows = await db
    .select({ goal: goals, kind: horizons.kind })
    .from(goals)
    .innerJoin(horizons, eq(goals.horizonId, horizons.id))
    .where(eq(goals.userId, userId));

  const enriched = await attachDimensions(rows.map((r) => r.goal));
  const kindById = new Map(rows.map((r) => [r.goal.id, r.kind]));
  return enriched.map((g) => ({ ...g, kind: kindById.get(g.id)! }));
}

/** Lightweight option list (id + title) for parent-connection dropdowns. */
export type GoalOption = { id: string; title: string };

export async function getGoalOptions(
  userId: string,
  horizonId: string | undefined,
): Promise<GoalOption[]> {
  if (!horizonId) return [];
  const rows = await db
    .select({ id: goals.id, title: goals.title })
    .from(goals)
    .where(
      and(
        eq(goals.userId, userId),
        eq(goals.horizonId, horizonId),
        eq(goals.status, "active"),
      ),
    );
  return rows;
}
