import Link from "next/link";
import type { ReactNode } from "react";
import { TopNav } from "@/components/TopNav";

export const metadata = {
  title: "Learn · LBO Debt Visualizer",
  description: "What debt scheduling does to LBO returns — explained.",
};

export default function LearnPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopNav active="learn" />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 lg:px-8 py-16 lg:py-20">
        <p className="fin-eyebrow mb-5">A 5-minute primer</p>
        <h1 className="font-serif text-4xl lg:text-5xl text-ink leading-[1.08] tracking-tightish mb-6">
          How debt scheduling shapes the returns on a leveraged buyout.
        </h1>
        <p className="text-[15px] text-graphite leading-relaxed mb-12">
          You don't need to be a banker to feel why LBOs work — or why they
          break. This page explains the moving parts in plain English. When
          you're done, open the visualizer and try them yourself.
        </p>

        <Section title="What an LBO actually is">
          <p>
            A leveraged buyout is the purchase of a company financed mostly
            with <em>borrowed money</em>. A sponsor (a private-equity firm) puts
            in a slice of equity — often 20–40% of the price — and stacks the
            rest with debt of varying seniority and cost. The acquired company
            then carries that debt on its own balance sheet and pays it down
            from its own cash flow.
          </p>
          <p>
            The magic, when it works, is that the sponsor's equity is small
            relative to the enterprise. If the business doubles in value, the
            equity multiplies several times over. The cost: that same leverage
            is unforgiving if the business stumbles.
          </p>
        </Section>

        <Section title="Why the debt schedule matters">
          <p>
            The capital stack isn't one number — it's a stack of tranches, each
            with its own coupon, maturity, amortization profile, and pecking
            order in a default. The order in which cash flow flows to each
            tranche, year after year, is the <em>debt schedule</em>.
          </p>
          <p>
            Two deals can look identical on paper — same price, same EBITDA,
            same exit assumption — and produce very different sponsor IRRs
            depending entirely on how the debt is structured.
          </p>
        </Section>

        <Section title="The 4-block waterfall, year by year">
          <p>
            Every year of the hold, the company runs the same cascade. The
            visualizer is built around it.
          </p>
          <Numbered
            items={[
              {
                tag: "①",
                title: "Cash generation",
                detail:
                  "Net income + D&A − change in working capital − capex. This is the cash the company actually produces, before any debt service.",
              },
              {
                tag: "②",
                title: "Mandatory amortization",
                detail:
                  "Pre-scheduled debt repayments (TLA typically 10% per year, TLB 1%, plus seller notes). The company has no choice — this comes off the top.",
              },
              {
                tag: "③",
                title: "Revolver gate",
                detail:
                  "If cash after mandatory is below the minimum balance, the revolver gets drawn. If above, excess cash advances to step 4.",
              },
              {
                tag: "④",
                title: "Optional sweep cascade",
                detail:
                  "A % of the remaining excess (the sweep %) is applied to debt prepayments in seniority order — revolver first, then TLA, TLB, and so on. Whatever isn't swept stays on the balance sheet as cash.",
              },
            ]}
          />
        </Section>

        <Section title="The tranches, ranked">
          <p>
            Senior → junior. Each layer is cheaper than the one above it (in
            coupon) but more dilutive (in equity kicker) the further down you
            go.
          </p>
          <Tranche name="Existing Debt" coupon="~6%" note="Assumed from the seller; amortizes on its own schedule." />
          <Tranche name="Bank Revolver" coupon="~5.5%" note="Working-capital line. Drawn when cash is short, repaid when surplus." />
          <Tranche name="Term Loan A (TLA)" coupon="~6%" note="Bank-syndicated, 10% straight-line amort, 6-yr maturity." />
          <Tranche name="Term Loan B (TLB)" coupon="~7%" note="Institutional, 1% amort, bullet at maturity, often cov-lite." />
          <Tranche name="Senior Notes" coupon="~8%" note="Public bond, bullet, often non-callable for 3-4 yrs." />
          <Tranche name="Subordinated Notes" coupon="~10%" note="Behind senior debt; small equity kicker." />
          <Tranche name="Mezzanine" coupon="~12%" note="PIK option (interest accretes to balance), 3–5% equity kicker." />
          <Tranche name="Seller Notes" coupon="~5%" note="Cheap because the seller wants the deal done; amortizes fast." />
          <Tranche name="Preferred Stock" coupon="~10%" note="Hybrid — dividends accrue, retired before common equity at exit." />
        </Section>

        <Section title="Three levers that move sponsor IRR">
          <Lever
            tag="A"
            title="Leverage"
            detail="More debt at close = smaller sponsor equity check. If the business performs, the same dollar gain divided by a smaller check is a much higher IRR. This is the engine of LBO returns."
          />
          <Lever
            tag="B"
            title="Cash sweep %"
            detail="A 100% sweep aggressively pays down debt with excess cash. A 0% sweep lets cash pile up. With cheap debt the IRR barely moves either way — what matters more is whether the cash gets out the door as a dividend or sits on the balance sheet."
          />
          <Lever
            tag="C"
            title="Equity kickers"
            detail="Mezz and sub debt get cheap by accepting an equity slice (3–5% of fully-diluted equity). It looks like cheap debt up front but dilutes sponsor share at exit. The tradeoff only pays off if the deal generates enough enterprise value to make the dilution worth it."
          />
        </Section>

        <Section title="What can go wrong">
          <p>
            Heavy leverage assumes the business keeps performing. If EBITDA
            contracts (a recession, a customer loss, a margin squeeze), three
            things happen in sequence: cash flow drops, the revolver gets
            drawn to fund the gap, and leverage spikes precisely when you'd
            want it to fall.
          </p>
          <p>
            The COVID Stress preset shows the textbook case — same deal, same
            structure, but Y1–Y2 revenue declines. The sponsor IRR collapses
            from 35% to 13%, and you can watch the revolver get pulled in the
            waterfall.
          </p>
        </Section>

        <Section title="Now go play with it">
          <p>
            The visualizer reproduces all of this live. Edit any input, watch
            the cap stack reshape and the IRR move. The plain-English
            explainer panel will tell you why.
          </p>
          <div className="mt-4">
            <Link href="/visualizer" className="fin-cta-gold">
              Open the Visualizer →
            </Link>
          </div>
        </Section>
      </main>

      <footer className="border-t border-silver px-8 py-6 text-[11px] text-mid text-center tracking-tight">
        Built as an educational tool. Numbers are illustrative, not investment advice.
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-16">
      <h2 className="font-serif text-2xl lg:text-3xl text-ink tracking-tightish mb-5">
        {title}
      </h2>
      <div className="space-y-4 text-[14px] text-graphite leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function Numbered({
  items,
}: {
  items: { tag: string; title: string; detail: string }[];
}) {
  return (
    <div className="mt-4 space-y-4">
      {items.map((it, i) => (
        <div key={i} className="flex gap-4">
          <span className="font-serif text-2xl text-champagneDeep leading-none mt-1">
            {it.tag}
          </span>
          <div>
            <div className="font-medium text-ink mb-1">{it.title}</div>
            <p className="text-[13px] text-graphite leading-relaxed">{it.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Tranche({ name, coupon, note }: { name: string; coupon: string; note: string }) {
  return (
    <div className="grid grid-cols-[120px_60px_1fr] gap-4 py-2 border-t border-silver/70 items-start text-[13px]">
      <div className="text-ink font-medium">{name}</div>
      <div className="text-mid font-mono tabular-nums">{coupon}</div>
      <div className="text-graphite">{note}</div>
    </div>
  );
}

function Lever({ tag, title, detail }: { tag: string; title: string; detail: string }) {
  return (
    <div className="flex gap-4 mt-4">
      <span className="font-serif text-3xl text-mid leading-none mt-1">{tag}</span>
      <div>
        <div className="font-medium text-ink mb-1">{title}</div>
        <p className="text-[13px] text-graphite leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}
