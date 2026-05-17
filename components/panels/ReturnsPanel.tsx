"use client";

import { useDealStore } from "@/lib/store.ts";
import { fmtMoney, fmtMult, fmtPct, classNames } from "@/lib/format.ts";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

function irrBadgeColor(irr: number): string {
  if (!Number.isFinite(irr)) return "text-navySoft";
  if (irr < 0.15) return "text-junior-700";
  if (irr < 0.25) return "text-amber-600";
  return "text-equity-700";
}

export function ReturnsPanel() {
  const outputs = useDealStore((s) => s.outputs);

  // Equity allocation breakdown (only nonzero recipients).
  const allocData = outputs.holders
    .filter((h) => h.exitValue > 0.01)
    .map((h) => ({
      name: h.label,
      value: h.exitValue,
      pct: h.sharePct,
      invested: h.invested,
      irr: h.irr,
      moic: h.moic,
    }));

  const totalValue = allocData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="fin-card h-full flex flex-col">
      <h3 className="fin-header mb-3">Return Outcome</h3>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="fin-label">Sponsor IRR</div>
          <div
            className={classNames(
              "text-3xl font-bold font-mono transition-all duration-300",
              irrBadgeColor(outputs.sponsorIRR)
            )}
          >
            {fmtPct(outputs.sponsorIRR)}
          </div>
        </div>
        <div className="text-center">
          <div className="fin-label">Sponsor MOIC</div>
          <div className="text-3xl font-bold font-mono text-navy">
            {fmtMult(outputs.sponsorMOIC)}
          </div>
        </div>
        <div className="text-center">
          <div className="fin-label">Equity @ Exit</div>
          <div className="text-3xl font-bold font-mono text-navy">
            {fmtMoney(outputs.exit.equityValue)}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="fin-label mb-1">Exit allocation (fully diluted)</div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={allocData} layout="vertical" margin={{ left: 90, right: 10 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(v: any, _n, p) => [
                  `${fmtMoney(Number(v))} · ${fmtPct((p.payload as any).pct)}`,
                  (p.payload as any).name,
                ]}
              />
              <Bar dataKey="value" animationDuration={400}>
                {allocData.map((d, i) => (
                  <Cell
                    key={i}
                    fill={
                      d.name.includes("Sponsor")
                        ? "#0F2A6B"
                        : d.name.includes("Mgmt")
                        ? "#3DAA66"
                        : d.name.includes("Mezz")
                        ? "#FFDDBF"
                        : d.name.includes("Sub")
                        ? "#FFB077"
                        : d.name.includes("Pref")
                        ? "#7F3F8F"
                        : "#7AA8F0"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <div className="fin-label mb-1">Sensitivity (exit multiple ±2x)</div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {(["bear", "base", "bull"] as const).map((k) => {
            const s = outputs.sensitivity[k];
            return (
              <div
                key={k}
                className={classNames(
                  "p-2 rounded border",
                  k === "base"
                    ? "border-navy bg-cream"
                    : "border-senior-100 bg-white"
                )}
              >
                <div className="fin-label">
                  {k === "bear" ? "Bear" : k === "bull" ? "Bull" : "Base"}
                </div>
                <div className="font-mono text-xs text-navySoft">
                  {fmtMult(s.multiple)}
                </div>
                <div className={classNames("font-mono text-lg font-bold", irrBadgeColor(s.irr))}>
                  {fmtPct(s.irr)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
