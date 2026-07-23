import type { Config } from "tailwindcss";

/**
 * Design tokens live as CSS variables in app/globals.css (see :root / .dark).
 * Tailwind maps semantic names to those variables so components stay theme-aware.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        surface: {
          DEFAULT: "hsl(var(--surface) / <alpha-value>)",
          elevated: "hsl(var(--surface-elevated) / <alpha-value>)",
        },
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--border) / <alpha-value>)",
        ring: "hsl(var(--accent-sienna) / <alpha-value>)",
        foreground: "hsl(var(--text-primary) / <alpha-value>)",
        muted: {
          DEFAULT: "hsl(var(--surface) / <alpha-value>)",
          foreground: "hsl(var(--text-muted) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--surface-elevated) / <alpha-value>)",
          foreground: "hsl(var(--text-secondary) / <alpha-value>)",
        },
        sienna: "hsl(var(--accent-sienna) / <alpha-value>)",
        amber: "hsl(var(--accent-amber) / <alpha-value>)",
        success: "hsl(var(--success) / <alpha-value>)",
        // shadcn-compatible aliases
        card: {
          DEFAULT: "hsl(var(--surface) / <alpha-value>)",
          foreground: "hsl(var(--text-primary) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--surface-elevated) / <alpha-value>)",
          foreground: "hsl(var(--text-primary) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--accent-sienna) / <alpha-value>)",
          foreground: "hsl(var(--text-primary) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--surface-elevated) / <alpha-value>)",
          foreground: "hsl(var(--text-primary) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(0 62% 45% / <alpha-value>)",
          foreground: "hsl(var(--text-primary) / <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
