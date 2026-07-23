import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/nav/sidebar";
import { MobileNav } from "@/components/nav/mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already gates this, but guard again for safety.
  if (!user) redirect("/login");

  return (
    <div className="flex h-screen flex-col md:flex-row">
      <div className="hidden md:block">
        <Sidebar email={user.email ?? null} />
      </div>
      <MobileNav />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-10 sm:px-10">{children}</div>
      </main>
    </div>
  );
}
