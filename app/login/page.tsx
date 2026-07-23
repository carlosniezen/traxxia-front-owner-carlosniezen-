import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link
            href="/"
            className="font-serif text-2xl font-medium tracking-tight"
          >
            Traxxia
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            El sistema operativo estratégico del ejecutivo
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
