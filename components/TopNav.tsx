import Link from "next/link";
import type { ReactNode } from "react";

export function TopNav({ active }: { active?: "home" | "learn" | "visualizer" }) {
  return (
    <header className="border-b border-silver bg-white sticky top-0 z-30 no-print">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="font-serif text-lg text-ink tracking-tightish">
            LBO Debt Visualizer
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink href="/" label="Home" active={active === "home"} />
          <NavLink href="/learn" label="Learn" active={active === "learn"} />
          <NavLink href="/visualizer" label="Visualizer" active={active === "visualizer"} primary />
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  label,
  active,
  primary,
}: {
  href: string;
  label: string;
  active?: boolean;
  primary?: boolean;
}) {
  if (primary) {
    return (
      <Link
        href={href}
        className={
          active
            ? "ml-2 px-4 py-2 rounded-md text-[12px] font-medium tracking-tight bg-charcoal text-white"
            : "ml-2 px-4 py-2 rounded-md text-[12px] font-medium tracking-tight bg-ink text-white hover:bg-charcoal transition-colors"
        }
      >
        {label} →
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className={
        "px-3 py-2 text-[12px] tracking-tight rounded-md transition-colors " +
        (active ? "text-ink font-medium" : "text-mid hover:text-ink")
      }
    >
      {label}
    </Link>
  );
}
