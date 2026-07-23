import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { DIMENSIONS } from "@/lib/dimensions";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-between px-6 py-12 sm:px-10">
      <header className="flex items-center justify-between">
        <span className="font-serif text-xl font-medium tracking-tight">
          Traxxia
        </span>
        <Link href="/login">
          <Button variant="ghost" size="sm">
            Entrar
          </Button>
        </Link>
      </header>

      <section className="max-w-2xl py-20">
        <p className="mb-5 text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Sistema operativo estratégico
        </p>
        <h1 className="text-balance text-5xl font-light leading-[1.1] sm:text-6xl">
          Tu estrategia, del{" "}
          <span className="text-amber">Norte</span> al día de{" "}
          <span className="text-amber">hoy</span>.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-secondary">
          Traxxia conecta tus horizontes temporales — vida, década, año,
          trimestre, semana, hoy — con las nueve dimensiones del framework
          S.T.R.A.T.E.G.I.C. Cada prioridad diaria encuentra su lugar en la
          cadena de coherencia.
        </p>
        <div className="mt-10 flex items-center gap-4">
          <Link href="/login">
            <Button size="lg">
              Comenzar <ArrowRight />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border pt-8">
        <p className="mb-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Nueve dimensiones
        </p>
        <div className="flex flex-wrap gap-2">
          {DIMENSIONS.map((d) => (
            <span
              key={d.id}
              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm text-secondary"
            >
              <span
                aria-hidden
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              {d.nameEs}
            </span>
          ))}
        </div>
      </footer>
    </main>
  );
}
