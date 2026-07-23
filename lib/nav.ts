import {
  Sun,
  CalendarDays,
  CalendarRange,
  Target,
  Trophy,
  Telescope,
  BookOpen,
  Layers,
  Compass,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Phase 1 has only Norte fully built; the rest render a placeholder. */
  ready?: boolean;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

/** Sidebar navigation, grouped. Order mirrors the temporal hierarchy. */
export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Horizontes",
    items: [
      { href: "/dashboard/hoy", label: "Hoy", icon: Sun, ready: true },
      { href: "/dashboard/semana", label: "Semana", icon: CalendarDays },
      { href: "/dashboard/mes", label: "Mes", icon: CalendarRange },
      {
        href: "/dashboard/trimestre",
        label: "Trimestre",
        icon: Target,
        ready: true,
      },
      { href: "/dashboard/ano", label: "Año", icon: Trophy, ready: true },
      { href: "/dashboard/decada", label: "Década", icon: Telescope },
      { href: "/dashboard/vida", label: "Vida", icon: BookOpen },
    ],
  },
  {
    title: "Estrategia",
    items: [
      { href: "/dashboard/horizontes", label: "Horizontes", icon: Layers },
      { href: "/dashboard/coherencia", label: "Coherencia", icon: Compass },
      {
        href: "/dashboard/diagnostico",
        label: "Diagnóstico",
        icon: ClipboardCheck,
      },
      { href: "/dashboard/norte", label: "Norte", icon: Compass, ready: true },
    ],
  },
];
