"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { createGoal } from "@/app/dashboard/goal-actions";
import type { GoalOption } from "@/lib/data/goals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { DimensionPicker } from "@/components/dimensions/dimension-picker";

export function AddGoalDialog({
  horizonId,
  title,
  triggerLabel,
  placeholder,
  parentOptions,
  parentLabel,
}: {
  horizonId: string;
  title: string;
  triggerLabel: string;
  placeholder: string;
  parentOptions?: GoalOption[];
  parentLabel?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [goalTitle, setGoalTitle] = React.useState("");
  const [dimensionIds, setDimensionIds] = React.useState<string[]>([]);
  const [parentGoalId, setParentGoalId] = React.useState<string>("");
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  function reset() {
    setGoalTitle("");
    setDimensionIds([]);
    setParentGoalId("");
    setError(null);
  }

  function submit() {
    setError(null);
    if (!goalTitle.trim()) {
      setError("Escribe un título");
      return;
    }
    startTransition(async () => {
      const res = await createGoal({
        horizonId,
        title: goalTitle,
        dimensionIds,
        parentGoalId: parentGoalId || null,
      });
      if (res.ok) {
        reset();
        setOpen(false);
        router.refresh();
      } else {
        setError(res.error ?? "No se pudo crear");
      }
    });
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> {triggerLabel}
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title={title}>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="goal-title">Título</Label>
            <Input
              id="goal-title"
              autoFocus
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder={placeholder}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
            />
          </div>

          {parentOptions && parentOptions.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="goal-parent">
                {parentLabel ?? "Conectar hacia arriba"}{" "}
                <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <select
                id="goal-parent"
                value={parentGoalId}
                onChange={(e) => setParentGoalId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Sin conexión</option>
                {parentOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label>
              Dimensiones{" "}
              <span className="text-muted-foreground">(hasta 3)</span>
            </Label>
            <DimensionPicker
              selected={dimensionIds}
              onChange={setDimensionIds}
            />
          </div>

          {error && (
            <p className="text-sm text-[hsl(0_62%_60%)]">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button onClick={submit} disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Crear
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
