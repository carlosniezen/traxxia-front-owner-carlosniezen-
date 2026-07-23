import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = { title: "Ajustes" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/dashboard"
        className="mb-8 inline-flex items-center gap-2 text-sm text-secondary hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>
      <Placeholder
        phase="Fase 5"
        title="Ajustes"
        description={`Perfil, idioma (es/en) y cuenta. Sesión: ${user.email}.`}
      />
    </main>
  );
}
