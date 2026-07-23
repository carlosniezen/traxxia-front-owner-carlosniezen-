import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getLatestDiagnostic,
  getDiagnosticHistory,
} from "@/lib/data/diagnostics";
import { DIMENSIONS, getDimension } from "@/lib/dimensions";
import { Button } from "@/components/ui/button";
import { DiagnosticoForm } from "./diagnostico-form";

export const metadata: Metadata = { title: "Diagnóstico" };

function rank(scores: Record<string, number>) {
  const ranked = DIMENSIONS.map((d) => ({
    id: d.id,
    score: scores[d.id] ?? 0,
  })).sort((a, b) => b.score - a.score);
  const overall = Math.round(
    ranked.reduce((a, r) => a + r.score, 0) / (ranked.length || 1),
  );
  return { ranked, overall };
}

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export default async function DiagnosticoPage({
  searchParams,
}: {
  searchParams: Promise<{ take?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { take } = await searchParams;
  const latest = await getLatestDiagnostic(user.id);
  const history = await getDiagnosticHistory(user.id);

  // No diagnostic yet, or explicitly retaking → show the questionnaire.
  if (!latest || take === "1") {
    return (
      <div className="animate-fade-in">
        <header className="mb-8">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Diagnóstico S.T.R.A.T.E.G.I.C.
          </p>
          <h1 className="text-4xl font-light">¿Cómo estás hoy?</h1>
          <p className="mt-3 max-w-lg text-secondary">
            27 afirmaciones, tres por dimensión. Responde con honestidad — del 1
            (totalmente en desacuerdo) al 5 (totalmente de acuerdo).
          </p>
        </header>
        <DiagnosticoForm />
      </div>
    );
  }

  const scores = latest.scores;
  const { ranked, overall } = rank(scores);
  const strengths = ranked.slice(0, 3);
  const gaps = [...ranked].reverse().slice(0, 3);

  return (
    <div className="animate-fade-in">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Diagnóstico · {fmtDate(new Date(latest.takenAt))}
          </p>
          <h1 className="text-4xl font-light">Tu diagnóstico</h1>
        </div>
        <Link href="/dashboard/diagnostico?take=1">
          <Button variant="secondary" size="sm">
            <RotateCcw className="h-4 w-4" /> Volver a tomar
          </Button>
        </Link>
      </header>

      <div className="mb-10 flex items-baseline gap-3">
        <span className="font-serif text-6xl font-light">{overall}</span>
        <span className="text-sm text-muted-foreground">
          score global · 0–100
        </span>
      </div>

      {/* Per-dimension bars */}
      <div className="space-y-3">
        {ranked.map((r) => {
          const dim = getDimension(r.id)!;
          return (
            <div key={r.id} className="flex items-center gap-3">
              <span className="w-40 shrink-0 text-sm text-secondary">
                {dim.nameEs}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-elevated">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${r.score}%`, backgroundColor: dim.color }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
                {r.score}
              </span>
            </div>
          );
        })}
      </div>

      {/* Strengths / gaps */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-success">
            Fortalezas
          </p>
          <ul className="space-y-2">
            {strengths.map((s) => (
              <li key={s.id} className="flex items-center justify-between">
                <span className="text-sm">{getDimension(s.id)!.nameEs}</span>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {s.score}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-amber">
            Brechas
          </p>
          <ul className="space-y-2">
            {gaps.map((s) => (
              <li key={s.id} className="flex items-center justify-between">
                <span className="text-sm">{getDimension(s.id)!.nameEs}</span>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {s.score}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {history.length > 1 && (
        <div className="mt-10 border-t border-border pt-6">
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Historial
          </p>
          <ul className="space-y-1.5">
            {history.map((h) => {
              const o = rank(h.scores).overall;
              return (
                <li
                  key={h.id}
                  className="flex items-center justify-between text-sm text-secondary"
                >
                  <span>{fmtDate(new Date(h.takenAt))}</span>
                  <span className="tabular-nums">{o}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
