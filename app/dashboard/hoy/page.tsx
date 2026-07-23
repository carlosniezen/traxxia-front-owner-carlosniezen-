import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ensureStandardHorizons } from "@/lib/data/horizons";
import {
  getGoalsByHorizon,
  getGoalOptions,
  getGoalChain,
} from "@/lib/data/goals";
import { longSpanishDate } from "@/lib/horizons";
import { GoalCard, type GoalChainItem } from "@/components/goals/goal-card";
import { AddGoalDialog } from "@/components/goals/add-goal-dialog";
import { DimensionChip } from "@/components/dimensions/dimension-chip";

export const metadata: Metadata = { title: "Hoy" };

const MAX_PRIORITIES = 3;

export default async function HoyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const horizons = await ensureStandardHorizons(user.id);
  const priorities = await getGoalsByHorizon(user.id, horizons.day.id);
  const outcomeOptions = await getGoalOptions(user.id, horizons.quarter.id);

  // Chain upward for each priority (outcome → bet).
  const chains = await Promise.all(
    priorities.map(async (p): Promise<GoalChainItem[]> => {
      const chain = await getGoalChain(user.id, p.id);
      return chain.map((c) => ({
        title: c.title,
        dimensionIds: c.dimensionIds,
      }));
    }),
  );

  // Coherencia del día: share of priorities connected upward.
  const connected = priorities.filter((p) => p.parentGoalId).length;
  const coherencia =
    priorities.length > 0
      ? Math.round((connected / priorities.length) * 100)
      : null;

  // Balance dimensional del día.
  const balance = new Map<string, number>();
  for (const p of priorities) {
    for (const d of p.dimensionIds) {
      balance.set(d, (balance.get(d) ?? 0) + 1);
    }
  }
  const balanceEntries = [...balance.entries()].sort((a, b) => b[1] - a[1]);

  const atMax = priorities.length >= MAX_PRIORITIES;

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Hoy · {horizons.day.label}
        </p>
        <h1 className="text-3xl font-light first-letter:uppercase">
          {longSpanishDate()}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3">
          <div>
            <span className="font-serif text-3xl font-light">
              {coherencia === null ? "—" : `${coherencia}%`}
            </span>
            <span className="ml-2 text-sm text-muted-foreground">
              coherencia del día
            </span>
          </div>
          {balanceEntries.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-xs text-muted-foreground">
                Balance:
              </span>
              {balanceEntries.map(([id, count]) => (
                <span key={id} className="inline-flex items-center gap-1">
                  <DimensionChip id={id} size="xs" showName={false} />
                  {count > 1 && (
                    <span className="text-xs text-muted-foreground">
                      ×{count}
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {priorities.length}/{MAX_PRIORITIES} prioridades
        </span>
        {!atMax && (
          <AddGoalDialog
            horizonId={horizons.day.id}
            title="Nueva prioridad de hoy"
            triggerLabel="Añadir prioridad"
            placeholder="¿Qué mueve la aguja hoy?"
            parentOptions={outcomeOptions}
            parentLabel="Conectar a outcome trimestral"
          />
        )}
      </div>

      {priorities.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Sin prioridades para hoy. Elige máximo 3 — el foco es una elección.
        </p>
      ) : (
        <div className="space-y-3">
          {priorities.map((p, i) => (
            <GoalCard
              key={p.id}
              id={p.id}
              title={p.title}
              completed={p.status === "completed"}
              dimensionIds={p.dimensionIds}
              chain={chains[i]}
              showConnectionWarning={!p.parentGoalId}
            />
          ))}
        </div>
      )}

      {atMax && (
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Has alcanzado el máximo de 3 prioridades. El foco es una elección.
        </p>
      )}
    </div>
  );
}
