import Link from "next/link";
import type { ReactNode } from "react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-senior-100 bg-white px-8 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <div className="text-xl font-bold text-navy">LBO Debt Visualizer</div>
            <div className="text-xs text-navySoft">
              Capital structure × debt waterfall × equity returns — live
            </div>
          </div>
          <Link
            href="/visualizer"
            className="px-4 py-2 rounded bg-navy text-white text-sm font-semibold hover:bg-navySoft transition"
          >
            Open Visualizer →
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-8 py-12">
        <section className="mb-12">
          <h1 className="text-4xl font-bold text-navy mb-4">
            Feel the cause-and-effect between capital structure and equity IRR.
          </h1>
          <p className="text-lg text-navySoft max-w-3xl">
            This tool isolates the <span className="font-semibold text-navy">debt waterfall</span>{" "}
            mechanics of a leveraged buyout. Edit any input — coupon, sweep %, mezz
            kicker, exit multiple — and watch the cap stack, year-by-year waterfall,
            tranche rollforward, and sponsor returns update instantly. The plain-English
            explainer tells you <em>why</em> the number moved.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card title="The capital stack, visualized">
            See the structure at close and at exit — senior shrinking, equity growing,
            mezz accreting from PIK before getting wiped at maturity.
          </Card>
          <Card title="The full waterfall, year by year">
            Cash from operations → mandatory amort → revolver gate → optional sweep
            cascade. Scrub the year slider to see how the cascade evolves.
          </Card>
          <Card title="Tranche balances over time">
            Watch TLA amortize away, sub notes stay flat then bullet, mezz PIK up
            then crash. Leverage ratio overlay shows the delevering story.
          </Card>
          <Card title="The 'so what' — returns">
            Sponsor IRR, MOIC, equity at exit. Allocation by recipient (sponsor,
            mgmt, kickers). Sensitivity ±2x exit multiple. Compare against any
            baseline you snapshot.
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-navy mb-3">Try the presets</h2>
          <ul className="list-disc pl-5 text-navySoft space-y-1">
            <li><strong>Base case</strong> — reproduces the reference deal (~27% sponsor IRR target).</li>
            <li><strong>Conservative LBO</strong> — low leverage, all senior, modest growth.</li>
            <li><strong>Aggressive 2007</strong> — heavy mezz, PIK toggles on, max leverage.</li>
            <li><strong>COVID Stress Test</strong> — same deal, Y1-Y2 EBITDA contraction.</li>
            <li><strong>Cash Sweep Off</strong> — IRR barely moves; cash piles on the balance sheet instead.</li>
            <li><strong>No Junior Debt</strong> — mezz replaced with sponsor equity; IRR drops.</li>
          </ul>
        </section>

        <div className="flex justify-center">
          <Link
            href="/visualizer"
            className="px-8 py-4 rounded-lg bg-navy text-white text-lg font-bold hover:bg-navySoft transition shadow-lg"
          >
            Build Your Deal →
          </Link>
        </div>
      </main>

      <footer className="border-t border-senior-100 px-8 py-4 text-xs text-navySoft text-center">
        Built as an educational tool. Numbers are illustrative, not investment advice.
      </footer>
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="fin-card">
      <div className="fin-header text-lg mb-2">{title}</div>
      <div className="text-sm text-navySoft">{children}</div>
    </div>
  );
}
