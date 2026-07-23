"use client";

import * as React from "react";
import { DIMENSIONS, getDimension } from "@/lib/dimensions";
import { cn } from "@/lib/utils";

export type BoardGoal = {
  id: string;
  title: string;
  dimensionIds: string[];
  parentGoalId: string | null;
  completed: boolean;
  kind: string;
};

type Level = { kind: string; title: string; label?: string };

const LEVELS: Level[] = [
  { kind: "life", title: "Vida" },
  { kind: "decade", title: "Década" },
  { kind: "year", title: "Año" },
  { kind: "quarter", title: "Trimestre" },
  { kind: "month", title: "Mes" },
  { kind: "week", title: "Semana" },
  { kind: "day", title: "Hoy" },
];

export function HorizontesBoard({
  goals,
  norte,
  labels,
}: {
  goals: BoardGoal[];
  norte: { proposito: string; valores: string[] } | null;
  labels: Record<string, string>;
}) {
  const [hidden, setHidden] = React.useState<Set<string>>(
    new Set(["decade", "month"]),
  );
  const [filter, setFilter] = React.useState<Set<string>>(new Set());
  const [hoverId, setHoverId] = React.useState<string | null>(null);

  // Parent/child maps for connection highlighting.
  const { parentOf, childrenOf } = React.useMemo(() => {
    const parentOf = new Map<string, string>();
    const childrenOf = new Map<string, string[]>();
    for (const g of goals) {
      if (g.parentGoalId) {
        parentOf.set(g.id, g.parentGoalId);
        childrenOf.set(g.parentGoalId, [
          ...(childrenOf.get(g.parentGoalId) ?? []),
          g.id,
        ]);
      }
    }
    return { parentOf, childrenOf };
  }, [goals]);

  const connected = React.useMemo(() => {
    if (!hoverId) return null;
    const set = new Set<string>([hoverId]);
    let p = parentOf.get(hoverId);
    while (p) {
      set.add(p);
      p = parentOf.get(p);
    }
    const stack = [hoverId];
    while (stack.length) {
      const c = stack.pop()!;
      for (const ch of childrenOf.get(c) ?? []) {
        if (!set.has(ch)) {
          set.add(ch);
          stack.push(ch);
        }
      }
    }
    return set;
  }, [hoverId, parentOf, childrenOf]);

  const filterActive = filter.size > 0;
  function passesFilter(dims: string[]) {
    if (!filterActive) return true;
    return dims.some((d) => filter.has(d));
  }

  function toggleFilter(id: string) {
    setFilter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleLevel(kind: string) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  }

  const visibleLevels = LEVELS.filter((l) => !hidden.has(l.kind));

  return (
    <div>
      {/* Controls */}
      <div className="mb-6 space-y-4">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Filtrar por dimensión
          </p>
          <div className="flex flex-wrap gap-1.5">
            {DIMENSIONS.map((d) => {
              const active = filter.has(d.id);
              return (
                <button
                  key={d.id}
                  onClick={() => toggleFilter(d.id)}
                  title={d.nameEs}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                    active
                      ? "border-transparent text-[hsl(var(--background))]"
                      : "border-border text-secondary hover:border-secondary",
                  )}
                  style={active ? { backgroundColor: d.color } : undefined}
                >
                  <span
                    aria-hidden
                    className="inline-block h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: active
                        ? "hsl(var(--background))"
                        : d.color,
                    }}
                  />
                  {d.nameEs}
                </button>
              );
            })}
            {filterActive && (
              <button
                onClick={() => setFilter(new Set())}
                className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Mostrar horizontes
          </p>
          <div className="flex flex-wrap gap-1.5">
            {LEVELS.map((l) => {
              const shown = !hidden.has(l.kind);
              return (
                <button
                  key={l.kind}
                  onClick={() => toggleLevel(l.kind)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs transition-colors",
                    shown
                      ? "border-sienna/60 bg-surface-elevated text-foreground"
                      : "border-border text-muted-foreground line-through",
                  )}
                >
                  {l.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Board — horizontal scroll of level columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {visibleLevels.map((level) => {
          const items = goals.filter((g) => g.kind === level.kind);
          return (
            <div
              key={level.kind}
              className="w-64 shrink-0 rounded-lg border border-border bg-surface/50"
            >
              <div className="border-b border-border px-4 py-3">
                <p className="font-serif text-lg font-light">{level.title}</p>
                {(labels[level.kind] || level.kind === "life") && (
                  <p className="text-xs text-muted-foreground">
                    {level.kind === "life"
                      ? "Norte"
                      : labels[level.kind]}
                  </p>
                )}
              </div>

              <div className="space-y-2 p-3">
                {level.kind === "life" ? (
                  <LifeCard norte={norte} dimmed={filterActive} />
                ) : items.length === 0 ? (
                  <p className="px-1 py-4 text-center text-xs text-muted-foreground">
                    —
                  </p>
                ) : (
                  items.map((g) => {
                    const passes = passesFilter(g.dimensionIds);
                    const isConnected = connected?.has(g.id);
                    const dim =
                      connected && !isConnected
                        ? "opacity-25"
                        : !passes
                          ? "opacity-20"
                          : "";
                    return (
                      <div
                        key={g.id}
                        onMouseEnter={() => setHoverId(g.id)}
                        onMouseLeave={() => setHoverId(null)}
                        className={cn(
                          "cursor-default rounded-md border bg-surface p-2.5 transition-all",
                          isConnected
                            ? "border-sienna"
                            : "border-border",
                          dim,
                        )}
                      >
                        <p
                          className={cn(
                            "text-sm leading-snug",
                            g.completed && "text-muted-foreground line-through",
                          )}
                        >
                          {g.title}
                        </p>
                        {g.dimensionIds.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {g.dimensionIds.map((d) => {
                              const dd = getDimension(d);
                              if (!dd) return null;
                              return (
                                <span
                                  key={d}
                                  title={dd.nameEs}
                                  className="inline-block h-2 w-2 rounded-full"
                                  style={{ backgroundColor: dd.color }}
                                />
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Pasa el cursor sobre un objetivo para resaltar su cadena de coherencia
        entre niveles.
      </p>
    </div>
  );
}

function LifeCard({
  norte,
  dimmed,
}: {
  norte: { proposito: string; valores: string[] } | null;
  dimmed: boolean;
}) {
  if (!norte || (!norte.proposito && norte.valores.length === 0)) {
    return (
      <p className="px-1 py-4 text-center text-xs text-muted-foreground">
        Define tu Norte
      </p>
    );
  }
  return (
    <div className={cn("rounded-md border border-border bg-surface p-3", dimmed && "opacity-20")}>
      {norte.proposito && (
        <p className="font-serif text-sm font-light leading-snug">
          {norte.proposito}
        </p>
      )}
      {norte.valores.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {norte.valores.map((v, i) => (
            <span
              key={i}
              className="rounded-full border border-border px-2 py-0.5 text-[0.65rem] text-secondary"
            >
              {v}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
