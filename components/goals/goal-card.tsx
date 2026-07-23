"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CornerLeftUp, Trash2, AlertCircle } from "lucide-react";
import {
  toggleGoalComplete,
  deleteGoal,
} from "@/app/dashboard/goal-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { DimensionChip } from "@/components/dimensions/dimension-chip";
import { cn } from "@/lib/utils";

export type GoalChainItem = { title: string; dimensionIds: string[] };

export function GoalCard({
  id,
  title,
  completed,
  dimensionIds,
  chain,
  showConnectionWarning,
  progress,
}: {
  id: string;
  title: string;
  completed: boolean;
  dimensionIds: string[];
  chain?: GoalChainItem[];
  showConnectionWarning?: boolean;
  progress?: { total: number; completed: number };
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function toggle() {
    startTransition(async () => {
      await toggleGoalComplete(id);
      router.refresh();
    });
  }

  function remove() {
    if (!window.confirm("¿Eliminar este objetivo?")) return;
    startTransition(async () => {
      await deleteGoal(id);
      router.refresh();
    });
  }

  const pct =
    progress && progress.total > 0
      ? Math.round((progress.completed / progress.total) * 100)
      : null;

  return (
    <div
      className={cn(
        "group rounded-lg border border-border bg-surface p-4 transition-colors",
        completed && "opacity-60",
      )}
    >
      {chain && chain.length > 0 && (
        <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <CornerLeftUp className="h-3.5 w-3.5" />
          {chain.map((c, i) => (
            <span key={i} className="inline-flex items-center gap-1.5">
              {i > 0 && <span aria-hidden>·</span>}
              <span className="text-secondary">{c.title}</span>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          <Checkbox
            checked={completed}
            onCheckedChange={toggle}
            disabled={pending}
            aria-label={completed ? "Marcar como activo" : "Completar"}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-[0.95rem] leading-snug",
              completed && "line-through",
            )}
          >
            {title}
          </p>

          {(dimensionIds.length > 0 || showConnectionWarning) && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {dimensionIds.map((d) => (
                <DimensionChip key={d} id={d} size="xs" />
              ))}
              {showConnectionWarning && (
                <span className="inline-flex items-center gap-1 text-xs text-amber">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Sin conexión estratégica — ¿pertenece aquí?
                </span>
              )}
            </div>
          )}

          {pct !== null && (
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Progreso</span>
                <span>
                  {progress!.completed}/{progress!.total} · {pct}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
                <div
                  className="h-full rounded-full bg-success transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={remove}
          disabled={pending}
          aria-label="Eliminar"
          className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
