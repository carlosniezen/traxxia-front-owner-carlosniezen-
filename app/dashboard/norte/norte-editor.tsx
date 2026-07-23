"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Plus, X } from "lucide-react";
import { saveNorte } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Props = {
  initial: {
    proposito: string;
    valores: string[];
    vision75: string;
  };
};

const MAX_VALORES = 7;

export function NorteEditor({ initial }: Props) {
  const router = useRouter();
  const [proposito, setProposito] = React.useState(initial.proposito);
  const [valores, setValores] = React.useState<string[]>(
    initial.valores.length ? initial.valores : [""],
  );
  const [vision75, setVision75] = React.useState(initial.vision75);
  const [pending, startTransition] = React.useTransition();
  const [status, setStatus] = React.useState<"idle" | "saved" | "error">(
    "idle",
  );
  const [error, setError] = React.useState<string | null>(null);

  function updateValor(index: number, value: string) {
    setValores((prev) => prev.map((v, i) => (i === index ? value : v)));
  }

  function addValor() {
    setValores((prev) =>
      prev.length >= MAX_VALORES ? prev : [...prev, ""],
    );
  }

  function removeValor(index: number) {
    setValores((prev) => prev.filter((_, i) => i !== index));
  }

  function onSave() {
    setError(null);
    setStatus("idle");
    const cleanedValores = valores.map((v) => v.trim()).filter(Boolean);
    startTransition(async () => {
      const res = await saveNorte({
        proposito: proposito.trim(),
        valores: cleanedValores,
        vision75: vision75.trim(),
      });
      if (res.ok) {
        setStatus("saved");
        setValores(cleanedValores.length ? cleanedValores : [""]);
        router.refresh();
        setTimeout(() => setStatus("idle"), 2500);
      } else {
        setStatus("error");
        setError(res.error ?? "No se pudo guardar");
      }
    });
  }

  return (
    <div className="space-y-12">
      {/* Propósito — the editorial centerpiece */}
      <section>
        <Label htmlFor="proposito" className="text-xs uppercase tracking-[0.16em]">
          Propósito
        </Label>
        <p className="mb-3 mt-1 text-sm text-muted-foreground">
          Una línea que responde: ¿por qué existes?
        </p>
        <Textarea
          id="proposito"
          value={proposito}
          onChange={(e) => setProposito(e.target.value)}
          placeholder="Escribe tu propósito en una sola línea…"
          className="min-h-[96px] resize-none border-0 border-b border-border bg-transparent px-0 font-serif text-2xl font-light leading-snug focus-visible:ring-0 md:text-3xl"
        />
      </section>

      {/* Valores */}
      <section>
        <Label className="text-xs uppercase tracking-[0.16em]">Valores</Label>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          Entre 3 y 7 valores que te definen.
        </p>
        <ul className="space-y-2">
          {valores.map((valor, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="w-5 text-right font-serif text-sm text-muted-foreground">
                {i + 1}
              </span>
              <Input
                value={valor}
                onChange={(e) => updateValor(i, e.target.value)}
                placeholder="Un valor…"
                maxLength={60}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Quitar valor"
                onClick={() => removeValor(i)}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
        {valores.length < MAX_VALORES && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addValor}
            className="mt-2 text-secondary"
          >
            <Plus className="h-4 w-4" /> Añadir valor
          </Button>
        )}
      </section>

      {/* Visión 75 */}
      <section>
        <Label htmlFor="vision75" className="text-xs uppercase tracking-[0.16em]">
          Visión a los 75
        </Label>
        <p className="mb-3 mt-1 text-sm text-muted-foreground">
          ¿Cómo se ve tu vida a los 75 años?
        </p>
        <Textarea
          id="vision75"
          value={vision75}
          onChange={(e) => setVision75(e.target.value)}
          placeholder="Describe la vida que quieres haber vivido…"
          className="min-h-[180px] font-serif text-lg font-light leading-relaxed"
        />
      </section>

      {/* Save bar */}
      <div className="sticky bottom-0 -mx-6 flex items-center gap-4 border-t border-border bg-background/90 px-6 py-4 backdrop-blur sm:-mx-10 sm:px-10">
        <Button onClick={onSave} disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : null}
          Guardar Norte
        </Button>
        {status === "saved" && (
          <span className="inline-flex items-center gap-1.5 text-sm text-success">
            <Check className="h-4 w-4" /> Guardado
          </span>
        )}
        {status === "error" && (
          <span className="text-sm text-[hsl(0_62%_60%)]">{error}</span>
        )}
      </div>
    </div>
  );
}
