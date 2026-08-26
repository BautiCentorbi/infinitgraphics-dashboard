import type { Metadata } from "next";
import { Syne, Darker_Grotesque } from "next/font/google";
import "./globals.css";

// Identidad visual definida en el diseño de Claude Design (2026-08-21).
// 2026-08-24: tipografía realineada a bcentorbi.com (Syne para
// display/títulos, Darker Grotesque para body) — mismo universo visual
// que el portfolio, aunque acá siga siendo dark-first. Reemplaza
// Bricolage Grotesque / Plus Jakarta Sans. Ver ARCHITECTURE.md, sección
// "Identidad visual".
const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const body = Darker_Grotesque({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "cm-suite",
  description: "Suite para creadores de contenido — clientes, calendario y feedback en un solo lugar.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
