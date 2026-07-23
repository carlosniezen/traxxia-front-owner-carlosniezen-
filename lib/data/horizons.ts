import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { horizons, type Horizon } from "@/lib/db/schema";
import { standardPeriods, type HorizonKind } from "@/lib/horizons";

export type StandardHorizons = Record<
  "year" | "quarter" | "month" | "week" | "day",
  Horizon
>;

/**
 * Idempotently ensures the five standard horizons exist for the current
 * period and returns them keyed by kind. Rolls forward naturally: a new week
 * creates a new week horizon while old goals stay attached to the old one.
 */
export async function ensureStandardHorizons(
  userId: string,
  ref: Date = new Date(),
): Promise<StandardHorizons> {
  const periods = standardPeriods(ref);
  const kinds = periods.map((p) => p.kind);

  const existing = await db
    .select()
    .from(horizons)
    .where(
      and(eq(horizons.userId, userId), inArray(horizons.kind, kinds)),
    );

  const result: Partial<Record<HorizonKind, Horizon>> = {};

  for (const period of periods) {
    const match = existing.find(
      (h) => h.kind === period.kind && h.startDate === period.startDate,
    );
    if (match) {
      result[period.kind] = match;
      continue;
    }
    const [created] = await db
      .insert(horizons)
      .values({
        userId,
        kind: period.kind,
        label: period.label,
        startDate: period.startDate,
        endDate: period.endDate,
      })
      .returning();
    if (created) result[period.kind] = created;
  }

  return result as StandardHorizons;
}
