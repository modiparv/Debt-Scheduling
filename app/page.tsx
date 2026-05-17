import Link from "next/link";
import type { ReactNode } from "react";
import { TopNav } from "@/components/TopNav";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopNav active="home" />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 lg:px-8 py-16 lg:py-20">
        <section className="mb-20">
          <p className="fin-eyebrow mb-5">An educational LBO tool</p>
          <h1 className="font-serif text-4xl lg:text-6xl text-ink leading-[1.05] tracking-tightish mb-8">
            Feel the cause-and-effect between capital structure and equity IRR.
          </h1>
          <p className="text-[15px] text-graphite max-w-2xl leading-relaxed mb-8">
            This tool isolates the <em>debt waterfall</em> mechanics of a leveraged buyout.
            Edit any input — coupon, sweep %, mezz kicker, exit multiple — and watch the
            cap stack, year-by-year cash waterfall, tranche rollforward, and sponsor returns
            update instantly. A plain-English explainer tells you <em>why</em> the
            number moved.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/visualizer" className="fin-cta-gold">
              Open the Visualizer →
            </Link>
            <Link
              href="/learn"
              className="px-5 py-2.5 rounded-md text-sm font-medium tracking-tight text-ink border border-ink hover:bg-ink hover:text-white transition-colors"
            >
              Read the 5-minute primer →
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          <Card title="The capital stack, visualized">
            See the structure at close and at exit — senior shrinking, equity growing,
            mezz accreting from PIK before getting wiped at maturity. Hover any tranche
            for the coupon, term, and lifetime interest.
          </Card>
          <Card title="The full waterfall, year by year">
            Cash from operations → mandatory amort → revolver gate → optional sweep
            cascade. Each step is a proportional bar broken down by tranche. Scrub the
            year slider to see how the cascade evolves.
          </Card>
          <Card title="Tranche balances over time">
            Watch TLA amortize away, sub notes stay flat then bullet, mezz PIK up
            then crash. Leverage overlay shows the delevering story.
          </Card>
          <Card title="The “so what” — returns">
            Sponsor IRR, MOIC, equity at exit. Allocation by recipient (sponsor,
            mgmt, kickers). Sensitivity ±2x exit multiple. Compare against any
            baseline you snapshot.
          </Card>
        </section>

        <section className="mb-20">
          <h2 className="font-serif text-2xl lg:text-3xl text-ink mb-5 tracking-tightish">
            How to use it
          </h2>
          <ol className="space-y-3 text-[14px] text-graphite leading-relaxed list-decimal pl-5">
            <li>
              Start with a preset — <strong>Base Case</strong>, <strong>Aggressive 2007</strong>,
              or <strong>COVID Stress Test</strong> all load a complete deal in one click.
            </li>
            <li>
              Edit any input on the left rail. Every change recomputes the whole deal
              instantly. The explainer panel tells you what just moved and why.
            </li>
            <li>
              Click <strong>Snapshot baseline</strong> when you find a deal you like,
              then keep editing — a side panel shows ΔIRR, ΔMOIC, and ΔEquity vs. the
              snapshot.
            </li>
            <li>
              Open <strong>Story mode</strong> for a guided 5-slide walkthrough: all-cash
              → modest leverage → aggressive → downturn → free play.
            </li>
            <li>
              Copy the share link to send your exact deal to someone else, or export
              the JSON to come back to it later.
            </li>
          </ol>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl lg:text-3xl text-ink mb-5 tracking-tightish">
            Six presets to compare
          </h2>
          <ul className="space-y-2 text-[14px] text-graphite leading-relaxed">
            <li><span className="text-ink">Base case</span> — reproduces the reference deal.</li>
            <li><span className="text-ink">Conservative LBO</span> — low leverage, all senior, modest growth.</li>
            <li><span className="text-ink">Aggressive 2007</span> — heavy mezz, PIK toggles on, max leverage.</li>
            <li><span className="text-ink">COVID Stress Test</span> — same deal, Y1–Y2 EBITDA contraction.</li>
            <li><span className="text-ink">Cash Sweep Off</span> — IRR barely moves; cash piles on the balance sheet instead.</li>
            <li><span className="text-ink">No Junior Debt</span> — mezz replaced with sponsor equity; IRR drops.</li>
          </ul>
        </section>
      </main>

      <footer className="border-t border-silver px-8 py-6 text-[11px] text-mid text-center tracking-tight">
        Built as an educational tool. Numbers are illustrative, not investment advice.
      </footer>
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="fin-card">
      <div className="font-serif text-lg text-ink mb-3 tracking-tightish">{title}</div>
      <div className="text-[13px] text-graphite leading-relaxed">{children}</div>
    </div>
  );
}
