import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LBO Debt Visualizer",
  description: "Interactive LBO debt scheduling and capital structure visualizer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
