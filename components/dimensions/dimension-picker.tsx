"use client";

import { DIMENSIONS } from "@/lib/dimensions";
import { cn } from "@/lib/utils";

/** Toggle-chip selector for 1–3 dimensions. */
export function DimensionPicker({
  selected,
  onChange,
  max = 3,
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
  max?: number;
}) {
  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else if (selected.length < max) {
      onChange([...selected, id]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {DIMENSIONS.map((d) => {
        const active = selected.includes(d.id);
        const atMax = !active && selected.length >= max;
        return (
          <button
            key={d.id}
            type="button"
            disabled={atMax}
            onClick={() => toggle(d.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
              active
                ? "border-transparent text-[hsl(var(--background))]"
                : "border-border text-secondary hover:border-secondary",
              atMax && "cursor-not-allowed opacity-40",
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
    </div>
  );
}
