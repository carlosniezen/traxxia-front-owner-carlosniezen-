"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { QUESTIONS, LIKERT_LABELS_ES } from "@/lib/questions";
import { DIMENSIONS } from "@/lib/dimensions";
import { saveDiagnostic } from "./actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DiagnosticoForm() {
  const router = useRouter();
  const [answers, setAnswers] = React.useState<Record<string, number>>({});
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const answered = Object.keys(answers).length;
  const complete = answered === QUESTIONS.length;

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await saveDiagnostic(answers);
      if (res.ok) {
        router.push("/dashboard/diagnostico");
        router.refresh();
      } else {
        setError(res.error ?? "No se pudo guardar");
      }
    });
  }

  return (
    <div className="pb-28">
      <div className="space-y-10">
        {DIMENSIONS.map((dim) => {
          const qs = QUESTIONS.filter((q) => q.dimensionId === dim.id);
          return (
            <section key={dim.id}>
              <div className="mb-4 flex items-center gap-2">
                <span
                  aria-hidden
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: dim.color }}
                />
                <h2 className="font-serif text-xl font-light">{dim.nameEs}</h2>
              </div>
              <div className="space-y-6">
                {qs.map((q) => (
                  <div key={q.id}>
                    <p className="mb-3 text-[0.95rem] text-secondary">
                      {q.text}
                    </p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((v) => {
                        const selected = answers[q.id] === v;
                        return (
                          <button
                            key={v}
                            type="button"
                            title={LIKERT_LABELS_ES[v - 1]}
                            onClick={() =>
                              setAnswers((prev) => ({ ...prev, [q.id]: v }))
                            }
                            className={cn(
                              "h-10 flex-1 rounded-md border text-sm transition-colors",
                              selected
                                ? "border-transparent bg-sienna text-[hsl(var(--text-primary))]"
                                : "border-border text-muted-foreground hover:border-secondary hover:text-foreground",
                            )}
                          >
                            {v}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur md:left-60">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-4 sm:px-10">
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-surface-elevated">
              <div
                className="h-full rounded-full bg-success transition-all"
                style={{ width: `${(answered / QUESTIONS.length) * 100}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground">
              {answered}/{QUESTIONS.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {error && (
              <span className="text-sm text-[hsl(0_62%_60%)]">{error}</span>
            )}
            <Button onClick={submit} disabled={!complete || pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Ver resultados
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
