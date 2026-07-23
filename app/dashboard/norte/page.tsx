import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getNorteForUser } from "@/lib/data/norte";
import { NorteEditor } from "./norte-editor";

export const metadata: Metadata = { title: "Norte" };

export default async function NortePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const existing = await getNorteForUser(user.id);

  return (
    <div className="animate-fade-in">
      <header className="mb-10">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Vida · tu constitución personal
        </p>
        <h1 className="text-4xl font-light">Norte</h1>
        <p className="mt-3 max-w-lg text-secondary">
          El punto fijo del que cuelga todo lo demás. Tómate el tiempo — esta es
          la vista más &ldquo;libro&rdquo; del producto.
        </p>
      </header>

      <NorteEditor
        initial={{
          proposito: existing?.proposito ?? "",
          valores: existing?.valores ?? [],
          vision75: existing?.vision75 ?? "",
        }}
      />
    </div>
  );
}
