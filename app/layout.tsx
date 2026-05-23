import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LBO Debt Visualizer · by Parv Modi",
  description:
    "Interactive LBO debt scheduling and capital structure visualizer. An educational tool by Parv Modi, modeled on a 10-sheet reference workbook.",
  authors: [{ name: "Parv Modi" }],
  creator: "Parv Modi",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="min-h-screen font-sans text-ink antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
