import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ensureStandardHorizons } from "@/lib/data/horizons";
import {
  getGoalsByHorizon,
  getGoalOptions,
  getChildProgress,
} from "@/lib/data/goals";
import { GoalCard } from "@/components/goals/goal-card";
import { AddGoalDialog } from "@/components/goals/add-goal-dialog";

export const metadata: Metadata = { title: "Trimestre" };

export default async function TrimestrePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const horizons = await ensureStandardHorizons(user.id);
  const outcomes = await getGoalsByHorizon(user.id, horizons.quarter.id);
  const annualBets = await getGoalOptions(user.id, horizons.year.id);
  const progress = await getChildProgress(
    user.id,
    outcomes.map((o) => o.id),
  );

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Horizonte · Trimestre
        </p>
        <h1 className="text-4xl font-light">{horizons.quarter.label}</h1>
        <p className="mt-3 max-w-lg text-secondary">
          Los outcomes de este trimestre. Cada uno cuelga de una apuesta anual;
          su progreso emerge de lo que completas debajo.
        </p>
      </header>

      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {outcomes.length} {outcomes.length === 1 ? "outcome" : "outcomes"}
        </span>
        <AddGoalDialog
          horizonId={horizons.quarter.id}
          title="Nuevo outcome trimestral"
          triggerLabel="Añadir outcome"
          placeholder="Ej: Cerrar 10 entrevistas con betas"
          parentOptions={annualBets}
          parentLabel="Conectar a apuesta anual"
        />
      </div>

      {outcomes.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Aún no hay outcomes para este trimestre.
        </p>
      ) : (
        <div className="space-y-3">
          {outcomes.map((o) => (
            <GoalCard
              key={o.id}
              id={o.id}
              title={o.title}
              completed={o.status === "completed"}
              dimensionIds={o.dimensionIds}
              progress={progress.get(o.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
