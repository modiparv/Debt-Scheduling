import Link from "next/link";
import type { ReactNode } from "react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-silver px-8 py-5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <div className="font-serif text-xl text-ink tracking-tightish">
              LBO Debt Visualizer
            </div>
            <div className="text-[11px] text-mid mt-0.5">
              Capital structure · debt waterfall · equity returns — live
            </div>
          </div>
          <Link href="/visualizer" className="fin-cta">
            Open Visualizer →
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-8 py-20">
        <section className="mb-24">
          <p className="fin-eyebrow mb-5">An educational LBO tool</p>
          <h1 className="font-serif text-5xl lg:text-6xl text-ink leading-[1.05] tracking-tightish mb-8">
            Feel the cause-and-effect between capital structure and equity IRR.
          </h1>
          <p className="text-[15px] text-graphite max-w-2xl leading-relaxed">
            This tool isolates the <em>debt waterfall</em> mechanics of a leveraged buyout.
            Edit any input — coupon, sweep %, mezz kicker, exit multiple — and watch the
            cap stack, year-by-year waterfall, tranche rollforward, and sponsor returns
            update instantly. A plain-English explainer tells you <em>why</em> the
            number moved.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
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
          <Card title="The “so what” — returns">
            Sponsor IRR, MOIC, equity at exit. Allocation by recipient (sponsor,
            mgmt, kickers). Sensitivity ±2x exit multiple. Compare against any
            baseline you snapshot.
          </Card>
        </section>

        <section className="mb-24">
          <h2 className="font-serif text-3xl text-ink mb-5 tracking-tightish">
            Try the presets
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

        <div className="flex justify-center">
          <Link href="/visualizer" className="fin-cta-gold">
            Build Your Deal →
          </Link>
        </div>
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
      <div className="font-serif text-xl text-ink mb-3 tracking-tightish">{title}</div>
      <div className="text-[13px] text-graphite leading-relaxed">{children}</div>
    </div>
  );
}
