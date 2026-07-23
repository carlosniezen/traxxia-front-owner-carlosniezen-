import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ensureStandardHorizons } from "@/lib/data/horizons";
import { getGoalGraph } from "@/lib/data/goals";
import { getNorteForUser } from "@/lib/data/norte";
import {
  HorizontesBoard,
  type BoardGoal,
} from "@/components/horizontes/horizontes-board";

export const metadata: Metadata = { title: "Horizontes" };

export default async function HorizontesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const horizons = await ensureStandardHorizons(user.id);
  const [graph, norte] = await Promise.all([
    getGoalGraph(user.id),
    getNorteForUser(user.id),
  ]);

  const goals: BoardGoal[] = graph.map((g) => ({
    id: g.id,
    title: g.title,
    dimensionIds: g.dimensionIds,
    parentGoalId: g.parentGoalId,
    completed: g.status === "completed",
    kind: g.kind,
  }));

  const labels: Record<string, string> = {
    year: horizons.year.label,
    quarter: horizons.quarter.label,
    month: horizons.month.label,
    week: horizons.week.label,
    day: horizons.day.label,
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          La vista maestra
        </p>
        <h1 className="text-4xl font-light">Horizontes</h1>
        <p className="mt-3 max-w-xl text-secondary">
          Del Norte al día de hoy en una sola pantalla. Filtra por dimensión,
          oculta niveles, y pasa el cursor sobre cualquier objetivo para ver su
          cadena de coherencia.
        </p>
      </header>

      <HorizontesBoard
        goals={goals}
        norte={
          norte
            ? { proposito: norte.proposito ?? "", valores: norte.valores }
            : null
        }
        labels={labels}
      />
    </div>
  );
}
