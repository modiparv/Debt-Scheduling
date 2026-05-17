"use client";

import { useDealStore } from "@/lib/store";
import { fmtMoney, fmtMult, fmtPct, classNames } from "@/lib/format";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

function irrColor(irr: number): string {
  if (!Number.isFinite(irr)) return "text-mid";
  if (irr < 0.15) return "text-junior-700";
  if (irr < 0.25) return "text-champagneDeep";
  return "text-ink";
}

function HeroMetric({
  label,
  value,
  accent,
  big = false,
}: {
  label: string;
  value: string;
  accent?: string;
  big?: boolean;
}) {
  return (
    <div className="flex flex-col items-start">
      <div className="fin-eyebrow mb-2">{label}</div>
      <div
        className={classNames(
          "font-serif tracking-tightish tabular-nums transition-all duration-500",
          big ? "text-6xl" : "text-4xl",
          accent ?? "text-ink"
        )}
      >
        {value}
      </div>
    </div>
  );
}

export function ReturnsPanel() {
  const outputs = useDealStore((s) => s.outputs);

  const allocData = outputs.holders
    .filter((h) => h.exitValue > 0.01)
    .map((h) => ({
      name: h.label,
      value: h.exitValue,
      pct: h.sharePct,
      invested: h.invested,
    }));

  const sensitivity = outputs.sensitivity;

  return (
    <div className="fin-card h-full flex flex-col">
      <div className="flex items-baseline justify-between mb-6">
        <h3 className="fin-header text-2xl">Return Outcome</h3>
        <span className="fin-eyebrow">at exit · year {outputs.exit.year}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8 pb-8 border-b border-silver">
        <HeroMetric
          label="Sponsor IRR"
          value={fmtPct(outputs.sponsorIRR)}
          accent={irrColor(outputs.sponsorIRR)}
          big
        />
        <HeroMetric label="Sponsor MOIC" value={fmtMult(outputs.sponsorMOIC)} />
        <HeroMetric label="Equity at Exit" value={fmtMoney(outputs.exit.equityValue)} />
        <HeroMetric label="Enterprise Value" value={fmtMoney(outputs.exit.enterpriseValue)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
        <div className="flex flex-col">
          <div className="fin-eyebrow mb-3">Exit allocation · fully diluted</div>
          <div className="flex-1 min-h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={allocData} layout="vertical" margin={{ left: 90, right: 12, top: 2, bottom: 2 }}>
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 10, fill: "#757575" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  contentStyle={{
                    fontSize: 11,
                    border: "1px solid #E0E0E0",
                    borderRadius: 6,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                  formatter={(v: any, _n, p) => [
                    `${fmtMoney(Number(v))} · ${fmtPct((p.payload as any).pct)}`,
                    (p.payload as any).name,
                  ]}
                />
                <Bar dataKey="value" animationDuration={400} radius={[0, 3, 3, 0]}>
                  {allocData.map((d, i) => (
                    <Cell
                      key={i}
                      fill={
                        d.name.includes("Sponsor")
                          ? "#1A1A1A"
                          : d.name.includes("Management") || d.name.includes("Mgmt Performance")
                          ? "#5E5E5E"
                          : d.name.includes("Mezz")
                          ? "#D4AF37"
                          : d.name.includes("Sub")
                          ? "#B89A3C"
                          : d.name.includes("Preferred")
                          ? "#5E3A6B"
                          : "#8A95B0"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <div className="fin-eyebrow mb-3">Sensitivity · exit multiple ±2x</div>
          <div className="grid grid-cols-3 gap-3">
            {(["bear", "base", "bull"] as const).map((k) => {
              const s = sensitivity[k];
              const isBase = k === "base";
              return (
                <div
                  key={k}
                  className={classNames(
                    "p-4 rounded-md border text-center transition-colors",
                    isBase ? "border-ink bg-platinum" : "border-silver bg-white"
                  )}
                >
                  <div className="fin-eyebrow mb-1">
                    {k === "bear" ? "Bear" : k === "bull" ? "Bull" : "Base"}
                  </div>
                  <div className="text-[11px] text-mid font-mono tabular-nums mb-2">
                    {fmtMult(s.multiple)}
                  </div>
                  <div
                    className={classNames(
                      "font-serif text-2xl tabular-nums",
                      irrColor(s.irr)
                    )}
                  >
                    {fmtPct(s.irr)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
