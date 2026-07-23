"use client";

import { useActionState } from "react";
import { Loader2, Mail } from "lucide-react";
import { sendMagicLink, type LoginState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: LoginState = { status: "idle" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    sendMagicLink,
    initialState,
  );

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
    </form>
  );
}
