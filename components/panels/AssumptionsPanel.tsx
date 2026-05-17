"use client";

import { useDealStore } from "@/lib/store";
import { computeWacc } from "@/lib/lbo-engine";
import { fmtMoney, fmtPct, fmtMult, classNames } from "@/lib/format";
import type { ReactNode } from "react";

export function AssumptionsPanel() {
  const inputs = useDealStore((s) => s.inputs);
  const op = inputs.operating;
  const wacc = computeWacc(inputs);
  const activeStack = inputs.stack.filter((t) => t.enabled);
  const undilutedEq = inputs.equity.sponsor + inputs.equity.mgmt + inputs.equity.newEquity;
  const totalKickers =
    (activeStack.find((t) => t.id === "sub_notes")?.kicker ?? 0) +
    (activeStack.find((t) => t.id === "mezz")?.kicker ?? 0) +
    (activeStack.find((t) => t.id === "preferred")?.kicker ?? 0) +
    (inputs.equity.mgmtPool ?? 0) +
    (inputs.equity.newEquityKicker ?? 0);

  return (
    <div className="fin-card h-full overflow-hidden flex flex-col">
      <div className="flex items-baseline justify-between mb-5 flex-wrap gap-2">
        <div>
          <h3 className="fin-header text-2xl">Model Assumptions</h3>
          <p className="text-[11px] text-mid mt-1">
            Every driver feeding the calculations, surfaced in one place. All
            monetary values in USD millions.
          </p>
        </div>
        <span className="fin-eyebrow">single source of truth</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto pr-1 flex-1">
        {/* Operating */}
        <Section title="Operating Drivers">
          <Row label="Starting revenue (Y1)" value={fmtMoney(op.revenueY1)} />
          <Row label="Revenue growth (annual)" value={fmtPct(op.revenueGrowth)} />
          <Row label="EBITDA margin (Y1)" value={fmtPct(op.ebitdaMargin)} />
          <Row label="Margin trajectory (Δ / yr)" value={`${op.marginTrajectory >= 0 ? "+" : ""}${(op.marginTrajectory * 100).toFixed(2)}pp`} />
          <Row label="CapEx (% of revenue)" value={fmtPct(op.capexPct)} />
          <Row label="NWC (% of revenue)" value={fmtPct(op.nwcPct)} />
          <Row label="D&A (% of revenue)" value={fmtPct(op.daPct)} />
          <Row label="Tax rate" value={fmtPct(op.taxRate)} />
          <Row label="NOL opening" value={fmtMoney(inputs.nolBalance ?? 0)} />
        </Section>

        {/* Sources / Equity / Exit */}
        <Section title="Capital & Exit">
          <Row label="Purchase price" value={fmtMoney(inputs.purchasePrice)} />
          <Row label="Fees" value={fmtMoney(inputs.fees)} />
          <Row label="Opening cash" value={fmtMoney(inputs.startingCash)} />
          <Row label="Revolver limit" value={fmtMoney(inputs.revolverLimit ?? 0)} />
          <Row label="Sponsor equity" value={fmtMoney(inputs.equity.sponsor)} />
          <Row label="Management equity" value={fmtMoney(inputs.equity.mgmt)} />
          <Row label="New equity" value={fmtMoney(inputs.equity.newEquity)} />
          <Row label="Mgmt performance pool" value={fmtPct(inputs.equity.mgmtPool)} />
          <Row label="Total equity kickers" value={fmtPct(totalKickers)} />
          <Row label="Exit year" value={`Year ${inputs.exit.exitYear}`} />
          <Row label="Exit EBITDA multiple" value={fmtMult(inputs.exit.exitMultiple)} />
          <Row label="Cash sweep %" value={fmtPct(inputs.exit.sweepPct)} />
          <Row label="Minimum cash" value={fmtMoney(inputs.exit.minCash)} />
        </Section>

        {/* WACC + DCF */}
        <Section title="WACC & DCF">
          <Row label="Risk-free rate" value={fmtPct(inputs.wacc?.riskFreeRate ?? 0.05)} />
          <Row label="Market risk premium" value={fmtPct(inputs.wacc?.marketRiskPremium ?? 0.045)} />
          <Row label="Levered beta" value={(inputs.wacc?.leveredBeta ?? 1.2).toFixed(2)} />
          <Row label="Cost of equity (CAPM)" value={fmtPct(wacc.costOfEquity)} accent />
          <Row label="Pre-tax cost of debt" value={fmtPct(wacc.preTaxKd)} />
          <Row label="Post-tax cost of debt" value={fmtPct(wacc.postTaxKd)} accent />
          <Row label="Cost of preferred" value={fmtPct(wacc.costOfPreferred)} />
          <Row label="Computed WACC" value={fmtPct(wacc.computedWacc)} accent strong />
          <Row label="Manual WACC override" value={fmtPct(inputs.wacc?.manualWacc ?? 0.085)} />
          <Row
            label="Effective WACC (in use)"
            value={`${fmtPct(wacc.effectiveWacc)} · ${inputs.wacc?.useComputed ? "computed" : "manual"}`}
            strong
          />
          <Row label="Terminal multiple (DCF)" value={fmtMult(inputs.wacc?.terminalMultiple ?? 6)} />
          <Row label="Perpetuity growth" value={fmtPct(inputs.wacc?.perpetuityGrowth ?? 0.03)} />
        </Section>
      </div>

      {/* Tranches */}
      <Section title={`Capital stack — ${activeStack.length} active tranches`}>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] tabular-nums">
            <thead className="text-mid uppercase tracking-wider2 text-[10px]">
              <tr>
                <th className="text-left py-1 pr-3">Tranche</th>
                <th className="text-right pr-3">Amount</th>
                <th className="text-right pr-3">Coupon</th>
                <th className="text-right pr-3">Maturity</th>
                <th className="text-right pr-3">Mandatory amort %/yr</th>
                <th className="text-right pr-3">PIK yrs</th>
                <th className="text-right pr-3">Kicker</th>
                <th className="text-center pr-2">Sweep</th>
              </tr>
            </thead>
            <tbody>
              {activeStack.map((t) => (
                <tr key={t.id} className="border-t border-silver/70">
                  <td className="py-1.5 pr-3 text-ink">
                    <span className="inline-block w-2 h-2 rounded-sm mr-2 align-middle" style={{ backgroundColor: t.color }} />
                    {t.label}
                  </td>
                  <td className="text-right pr-3">{fmtMoney(t.amount)}</td>
                  <td className="text-right pr-3">{fmtPct(t.coupon, 2)}</td>
                  <td className="text-right pr-3">Y{t.maturity}</td>
                  <td className="text-right pr-3">
                    {t.amortPct > 0 ? fmtPct(t.amortPct, 2) : <span className="text-mid italic">none / bullet</span>}
                  </td>
                  <td className="text-right pr-3">{t.pikYears > 0 ? `${t.pikYears} yrs` : "—"}</td>
                  <td className="text-right pr-3 text-champagneDeep">{t.kicker > 0 ? fmtPct(t.kicker) : "—"}</td>
                  <td className="text-center pr-2">{t.prepayable ? "✓" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="fin-eyebrow mb-3 pb-2 border-b border-silver">{title}</div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Row({ label, value, accent, strong }: { label: string; value: string; accent?: boolean; strong?: boolean }) {
  return (
    <div className="flex justify-between items-baseline py-1 text-[12px]">
      <span className={classNames("text-mid", strong && "text-ink font-medium")}>{label}</span>
      <span
        className={classNames(
          "font-mono tabular-nums",
          strong ? "text-ink font-semibold" : accent ? "text-champagneDeep" : "text-ink"
        )}
      >
        {value}
      </span>
    </div>
  );
}
