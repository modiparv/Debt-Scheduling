"use client";

import { useState } from "react";
import { useDealStore } from "@/lib/store";
import { fmtMoney, fmtPct, fmtMult, fmtNum } from "@/lib/format";
import type { Tranche, TrancheId, YearRow } from "@/lib/types";

interface LayerData {
  id?: TrancheId | "equity";
  label: string;
  amount: number;
  color: string;
  tranche?: Tranche;
}

function StackBar({
  title,
  subtitle,
  layers,
  total,
  onHover,
}: {
  title: string;
  subtitle?: string;
  layers: LayerData[];
  total: number;
  onHover: (l: LayerData | null, x: number, y: number) => void;
}) {
  const safeTotal = total || 1;
  const visible = layers.filter((l) => l.amount > 0).reverse();

  return (
    <div className="flex flex-col h-full">
      <div className="mb-2">
        <div className="fin-eyebrow">{title}</div>
        {subtitle && <div className="text-[11px] text-mid mt-0.5">{subtitle}</div>}
      </div>
      <div className="flex flex-col flex-1 w-full rounded-md overflow-hidden border border-silver">
        {visible.map((l, i) => {
          const pct = (l.amount / safeTotal) * 100;
          return (
            <div
              key={`${l.label}-${i}`}
              className="relative flex items-center justify-between px-4 text-[11px] font-medium text-white transition-all duration-500 ease-out cursor-pointer hover:brightness-110"
              style={{
                backgroundColor: l.color,
                height: `${pct}%`,
                minHeight: pct > 0 ? 22 : 0,
              }}
              onMouseEnter={(e) => onHover(l, e.clientX, e.clientY)}
              onMouseMove={(e) => onHover(l, e.clientX, e.clientY)}
              onMouseLeave={() => onHover(null, 0, 0)}
            >
              <span className="truncate pr-2 tracking-tight">{l.label}</span>
              <span className="font-mono tabular-nums">
                {fmtMoney(l.amount)} · {pct.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
      <div className="text-[11px] text-mid mt-2 text-right font-mono tabular-nums">
        Total {fmtMoney(total)}
      </div>
    </div>
  );
}

function Tooltip({
  layer,
  x,
  y,
  totalInterest,
  totalAmort,
  totalSwept,
}: {
  layer: LayerData;
  x: number;
  y: number;
  totalInterest: number;
  totalAmort: number;
  totalSwept: number;
}) {
  const t = layer.tranche;
  const offsetX = 16;
  const offsetY = 12;
  return (
    <div
      className="fixed z-50 pointer-events-none bg-white border border-silver shadow-card rounded-md p-4 w-72"
      style={{ left: Math.min(x + offsetX, window.innerWidth - 300), top: y + offsetY }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="inline-block w-3 h-3 rounded-sm"
          style={{ backgroundColor: layer.color }}
        />
        <div className="font-serif text-base text-ink">{layer.label}</div>
      </div>
      <div className="text-[11px] text-mid mb-3">
        {fmtMoney(layer.amount)} · {t ? "Debt tranche" : "Equity"}
      </div>

      {t ? (
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
          <dt className="text-mid">Coupon</dt>
          <dd className="text-ink font-mono tabular-nums text-right">
            {fmtPct(t.coupon)}
          </dd>
          <dt className="text-mid">Maturity</dt>
          <dd className="text-ink font-mono tabular-nums text-right">
            Year {t.maturity}
          </dd>
          {t.amortPct > 0 && (
            <>
              <dt className="text-mid">Annual amort</dt>
              <dd className="text-ink font-mono tabular-nums text-right">
                {fmtPct(t.amortPct)}
              </dd>
            </>
          )}
          {t.pikYears > 0 && (
            <>
              <dt className="text-mid">PIK period</dt>
              <dd className="text-ink font-mono tabular-nums text-right">
                {t.pikYears} {t.pikYears === 1 ? "yr" : "yrs"}
              </dd>
            </>
          )}
          {t.kicker > 0 && (
            <>
              <dt className="text-mid">Equity kicker</dt>
              <dd className="text-champagneDeep font-mono tabular-nums text-right">
                {fmtPct(t.kicker)}
              </dd>
            </>
          )}
          <dt className="text-mid">Prepayable</dt>
          <dd className="text-ink text-right">{t.prepayable ? "Yes" : "No"}</dd>

          <dt className="col-span-2 mt-2 pt-2 border-t border-silver text-mid uppercase tracking-wider2 text-[9px]">
            Through the hold
          </dt>
          <dt className="text-mid">Interest paid</dt>
          <dd className="text-ink font-mono tabular-nums text-right">
            {fmtMoney(totalInterest)}
          </dd>
          <dt className="text-mid">Mandatory amort</dt>
          <dd className="text-ink font-mono tabular-nums text-right">
            {fmtMoney(totalAmort)}
          </dd>
          <dt className="text-mid">Optional sweep</dt>
          <dd className="text-ink font-mono tabular-nums text-right">
            {fmtMoney(totalSwept)}
          </dd>
        </dl>
      ) : (
        <p className="text-[11px] text-mid leading-relaxed">
          Sponsor + management + other equity holders. At exit, this slice
          represents the residual claim after all debt is repaid.
        </p>
      )}
    </div>
  );
}

function buildLayers(
  stack: Tranche[],
  balances: Record<TrancheId, number>,
  equity: number
): LayerData[] {
  const layers: LayerData[] = [];
  for (const t of stack) {
    if (!t.enabled) continue;
    const amt = balances[t.id];
    if (amt > 0.01) {
      layers.push({ id: t.id, label: t.label, amount: amt, color: t.color, tranche: t });
    }
  }
  layers.push({ id: "equity", label: "Equity", amount: equity, color: "#1A1A1A" });
  return layers;
}

export function CapitalStackPanel() {
  const inputs = useDealStore((s) => s.inputs);
  const outputs = useDealStore((s) => s.outputs);

  const [hovered, setHovered] = useState<LayerData | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onHover = (layer: LayerData | null, x: number, y: number) => {
    setHovered(layer);
    if (layer) setPos({ x, y });
  };

  const y0Balances = {} as Record<TrancheId, number>;
  for (const t of inputs.stack) {
    y0Balances[t.id] = t.enabled ? t.amount : 0;
  }
  const y0Equity = inputs.equity.sponsor + inputs.equity.mgmt + inputs.equity.newEquity;
  const y0Layers = buildLayers(inputs.stack, y0Balances, y0Equity);
  const y0Total = y0Layers.reduce((s, l) => s + l.amount, 0);

  const exitRow = outputs.years.at(-1);
  const exitLayers = buildLayers(
    inputs.stack,
    exitRow?.trancheBalances ?? ({} as Record<TrancheId, number>),
    Math.max(0, outputs.exit.equityValue)
  );
  const exitTotal = exitLayers.reduce((s, l) => s + l.amount, 0);

  // Pre-compute totals per tranche for the hover tooltip.
  const totals = {
    interest: {} as Record<string, number>,
    mandatory: {} as Record<string, number>,
    optional: {} as Record<string, number>,
  };
  for (const t of inputs.stack) {
    let i = 0, m = 0, o = 0;
    for (const row of outputs.years) {
      i += row.trancheInterest[t.id] || 0;
      m += row.trancheMandatory[t.id] || 0;
      o += row.trancheOptional[t.id] || 0;
    }
    totals.interest[t.id] = i;
    totals.mandatory[t.id] = m;
    totals.optional[t.id] = o;
  }

  const hoveredInt = hovered?.id && hovered.id !== "equity" ? totals.interest[hovered.id] : 0;
  const hoveredAmort = hovered?.id && hovered.id !== "equity" ? totals.mandatory[hovered.id] : 0;
  const hoveredSwept = hovered?.id && hovered.id !== "equity" ? totals.optional[hovered.id] : 0;

  return (
    <div className="fin-card h-full flex flex-col relative">
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <h3 className="fin-header text-2xl">Capital Stack</h3>
          <p className="text-[11px] text-mid mt-1">
            Hover any tranche for coupon, term, and lifetime interest.
          </p>
        </div>
        <span className="fin-eyebrow">close → exit</span>
      </div>
      <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
        <StackBar title="At Close" subtitle={`Year 0 · ${fmtNum(outputs.years[0]?.leverageRatio ?? 0, 2)}x leverage`} layers={y0Layers} total={y0Total} onHover={onHover} />
        <StackBar
          title="At Exit"
          subtitle={`Year ${outputs.exit.year} · ${fmtNum(exitRow?.leverageRatio ?? 0, 2)}x leverage · ${fmtMult(inputs.exit.exitMultiple)} multiple`}
          layers={exitLayers}
          total={exitTotal}
          onHover={onHover}
        />
      </div>

      {hovered && (
        <Tooltip
          layer={hovered}
          x={pos.x}
          y={pos.y}
          totalInterest={hoveredInt}
          totalAmort={hoveredAmort}
          totalSwept={hoveredSwept}
        />
      )}
    </div>
  );
}
