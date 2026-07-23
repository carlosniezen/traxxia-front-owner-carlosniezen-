import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ensureStandardHorizons } from "@/lib/data/horizons";
import { getGoalsByHorizon, getOrphanGoals } from "@/lib/data/goals";
import { getLatestDiagnostic } from "@/lib/data/diagnostics";
import { DIMENSIONS, getDimension } from "@/lib/dimensions";
import { Button } from "@/components/ui/button";
import { StrategicRadar } from "@/components/charts/strategic-radar";
import type { EnrichedGoal } from "@/lib/data/goals";

export const metadata: Metadata = { title: "Coherencia" };

const KIND_LABEL: Record<string, string> = {
  day: "Hoy",
  week: "Semana",
  month: "Mes",
  quarter: "Trimestre",
};

function countByDimension(goals: EnrichedGoal[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const g of goals) {
    for (const d of g.dimensionIds) counts[d] = (counts[d] ?? 0) + 1;
  }
  return counts;
}

function Distribution({
  counts,
  emptyHint,
}: {
  counts: Record<string, number>;
  emptyHint: string;
}) {
  const max = Math.max(1, ...Object.values(counts));
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        {emptyHint}
      </p>
    );
  }
  return (
    <div className="space-y-2">
      {DIMENSIONS.map((d) => {
        const c = counts[d.id] ?? 0;
        return (
          <div key={d.id} className="flex items-center gap-3">
            <span className="w-40 shrink-0 text-sm text-secondary">
              {d.nameEs}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-elevated">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(c / max) * 100}%`,
                  backgroundColor: c === 0 ? "transparent" : d.color,
                }}
              />
            </div>
            <span className="w-6 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
              {c}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default async function CoherenciaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const horizons = await ensureStandardHorizons(user.id);
  const [bets, priorities, orphans, diagnostic] = await Promise.all([
    getGoalsByHorizon(user.id, horizons.year.id),
    getGoalsByHorizon(user.id, horizons.day.id),
    getOrphanGoals(user.id),
    getLatestDiagnostic(user.id),
  ]);

  const yearCounts = countByDimension(bets);
  const dayCounts = countByDimension(priorities);

  // Divergence: dimensions you bet on this year but 0% of today's focus.
  const betDims = new Set(Object.keys(yearCounts));
  const divergences = [...betDims].filter((d) => (dayCounts[d] ?? 0) === 0);

  return (
    <div className="animate-fade-in space-y-12">
      <header>
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Meta-vista
        </p>
        <h1 className="text-4xl font-light">Coherencia</h1>
        <p className="mt-3 max-w-lg text-secondary">
          ¿Tu tiempo real refleja tu estrategia declarada? Aquí emerge la
          respuesta.
        </p>
      </header>

      {/* 1. Radar */}
      <section>
        <h2 className="mb-4 font-serif text-2xl font-light">
          Radar S.T.R.A.T.E.G.I.C.
        </h2>
        {diagnostic ? (
          <div className="rounded-lg border border-border bg-surface p-4">
            <StrategicRadar scores={diagnostic.scores} />
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-secondary">
              Aún no tienes un diagnóstico. Tómalo para ver tu radar.
            </p>
            <Link href="/dashboard/diagnostico" className="mt-4 inline-block">
              <Button variant="secondary" size="sm">
                Tomar diagnóstico <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* 2. Distribución del año */}
      <section>
        <h2 className="mb-1 font-serif text-2xl font-light">
          Distribución del año
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Apuestas anuales por dimensión.
        </p>
        <Distribution
          counts={yearCounts}
          emptyHint="Sin apuestas anuales todavía — decláralas en la vista Año."
        />
      </section>

      {/* 3. Distribución del día */}
      <section>
        <h2 className="mb-1 font-serif text-2xl font-light">
          Distribución del día
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Prioridades de hoy por dimensión.
        </p>
        <Distribution
          counts={dayCounts}
          emptyHint="Sin prioridades hoy — decláralas en la vista Hoy."
        />
        {divergences.length > 0 && priorities.length > 0 && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-surface p-4 text-sm text-secondary">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
            <span>
              Apostaste este año por{" "}
              <span className="text-foreground">
                {divergences
                  .map((d) => getDimension(d)?.nameEs)
                  .filter(Boolean)
                  .join(", ")}
              </span>
              , pero hoy no aparece ninguna prioridad en esas dimensiones.
            </span>
          </div>
        )}
      </section>

      {/* 4. Cadena rota */}
      <section>
        <h2 className="mb-1 font-serif text-2xl font-light">Cadena rota</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Objetivos sin conexión hacia arriba — huérfanos de estrategia.
        </p>
        {orphans.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-success">
            Nada suelto. Toda tu ejecución cuelga de una apuesta.
          </p>
        ) : (
          <ul className="space-y-2">
            {orphans.map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
              >
                <span className="text-sm">{o.title}</span>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {KIND_LABEL[o.kind] ?? o.kind}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
