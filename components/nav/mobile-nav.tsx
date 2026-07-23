"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_SECTIONS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const ALL_ITEMS = NAV_SECTIONS.flatMap((s) => s.items);

/** Compact top bar with a horizontally scrollable pill nav for small screens. */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-border bg-surface md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="font-serif text-lg font-medium">
          Traxxia
        </Link>
        <ThemeToggle />
      </div>
      <div className="flex gap-2 overflow-x-auto px-4 pb-3">
        {ALL_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap rounded-full border px-3 py-1 text-sm",
                active
                  ? "border-sienna bg-surface-elevated text-foreground"
                  : "border-border text-secondary",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
