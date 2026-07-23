"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { NAV_SECTIONS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/auth/actions";

export function Sidebar({ email }: { email: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-surface">
      <div className="px-6 py-6">
        <Link href="/dashboard" className="font-serif text-xl font-medium">
          Traxxia
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="px-3 pb-2 text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-surface-elevated text-foreground"
                          : "text-secondary hover:bg-surface-elevated hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                      {!item.ready && (
                        <span className="ml-auto text-[0.65rem] text-muted-foreground">
                          pronto
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center justify-between px-2">
          <span className="truncate text-xs text-muted-foreground" title={email ?? ""}>
            {email}
          </span>
          <ThemeToggle />
        </div>
        <form action={signOut} className="mt-2">
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start text-secondary"
          >
            <LogOut className="h-4 w-4" /> Salir
          </Button>
        </form>
      </div>
    </aside>
  );
}
