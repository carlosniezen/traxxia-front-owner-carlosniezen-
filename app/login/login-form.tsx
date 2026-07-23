"use client";

import { useState, useTransition, useActionState } from "react";
import { Loader2, Mail, Sparkles } from "lucide-react";
import { sendMagicLink, enterDemo, type LoginState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: LoginState = { status: "idle" };
const DEMO_ENABLED = process.env.NEXT_PUBLIC_DEMO_ENABLED === "1";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    sendMagicLink,
    initialState,
  );
  const [demoPending, startDemo] = useTransition();
  const [demoError, setDemoError] = useState<string | null>(null);

  function onDemo() {
    setDemoError(null);
    startDemo(async () => {
      const res = await enterDemo();
      if (res && !res.ok) setDemoError(res.error ?? "No se pudo entrar");
    });
  }

  if (state.status === "sent") {
    return (
      <div className="space-y-3 text-center">
        <Mail className="mx-auto h-8 w-8 text-amber" />
        <h2 className="font-serif text-2xl font-light">Revisa tu correo</h2>
        <p className="text-sm text-secondary">
          Enviamos un enlace de acceso a{" "}
          <span className="text-foreground">{state.email}</span>. Ábrelo en este
          dispositivo para entrar.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Correo</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="tu@empresa.com"
          required
        />
      </div>

      {state.status === "error" && (
        <p className="text-sm text-[hsl(0_62%_60%)]">{state.message}</p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : null}
        Enviar enlace de acceso
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Sin contraseñas. Te enviamos un enlace mágico por correo.
      </p>

      {DEMO_ENABLED && (
        <div className="pt-2">
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-xs text-muted-foreground">
                o
              </span>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onDemo}
            disabled={demoPending}
          >
            {demoPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 text-amber" />
            )}
            Entrar como demo
          </Button>
          {demoError && (
            <p className="mt-2 text-center text-sm text-[hsl(0_62%_60%)]">
              {demoError}
            </p>
          )}
        </div>
      )}
    </form>
  );
}
