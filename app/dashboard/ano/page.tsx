import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ensureStandardHorizons } from "@/lib/data/horizons";
import { getGoalsByHorizon } from "@/lib/data/goals";
import { DIMENSIONS } from "@/lib/dimensions";
import { GoalCard } from "@/components/goals/goal-card";
import { AddGoalDialog } from "@/components/goals/add-goal-dialog";
import { DimensionChip } from "@/components/dimensions/dimension-chip";

export const metadata: Metadata = { title: "Año" };

export default async function AñoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const horizons = await ensureStandardHorizons(user.id);
  const bets = await getGoalsByHorizon(user.id, horizons.year.id);

  const covered = new Set(bets.flatMap((b) => b.dimensionIds));
  const missing = DIMENSIONS.filter((d) => !covered.has(d.id));

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Horizonte · Año
        </p>
        <h1 className="text-4xl font-light">{horizons.year.label}</h1>
        <p className="mt-3 max-w-lg text-secondary">
          Tus apuestas del año — hasta 9, idealmente una por dimensión. No es
          obligatorio, pero los vacíos dicen mucho.
        </p>
      </header>

      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {bets.length} {bets.length === 1 ? "apuesta" : "apuestas"}
        </span>
        <AddGoalDialog
          horizonId={horizons.year.id}
          title="Nueva apuesta anual"
          triggerLabel="Añadir apuesta"
          placeholder="Ej: Lanzar Traxxia a 50 usuarios beta"
        />
      </div>

      {bets.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Aún no has declarado apuestas para este año.
        </p>
      ) : (
        <div className="space-y-3">
          {bets.map((b) => (
            <GoalCard
              key={b.id}
              id={b.id}
              title={b.title}
              completed={b.status === "completed"}
              dimensionIds={b.dimensionIds}
            />
          ))}
        </div>
      )}

      {missing.length > 0 && (
        <div className="mt-10 border-t border-border pt-6">
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Dimensiones sin apuesta
          </p>
          <div className="flex flex-wrap gap-2">
            {missing.map((d) => (
              <DimensionChip key={d.id} id={d.id} className="opacity-60" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
