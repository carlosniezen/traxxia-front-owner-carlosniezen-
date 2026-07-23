import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-fraunces",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Traxxia Personal",
    template: "%s · Traxxia Personal",
  },
  description:
    "El sistema operativo estratégico del ejecutivo: horizontes temporales y el framework dimensional S.T.R.A.T.E.G.I.C.",
  applicationName: "Traxxia Personal",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0E1116",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${fraunces.variable} ${manrope.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
