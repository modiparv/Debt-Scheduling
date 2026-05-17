"use client";

import { useDealStore } from "@/lib/store.ts";
import { fmtMoney, fmtPct } from "@/lib/format.ts";
import type { Tranche, TrancheId } from "@/lib/types.ts";

// Vertical stacked bar: senior at the bottom, junior in the middle,
// equity at the top. Each layer shows label, dollars, and % of total.

function StackBar({
  title,
  layers,
  total,
}: {
  title: string;
  layers: { label: string; amount: number; color: string }[];
  total: number;
}) {
  const safeTotal = total || 1;
  const visible = layers.filter((l) => l.amount > 0).reverse(); // top first

  return (
    <div>
      <div className="text-xs text-navySoft mb-1">{title}</div>
      <div className="flex flex-col w-full h-72 rounded overflow-hidden border border-senior-100">
        {visible.map((l, i) => {
          const pct = (l.amount / safeTotal) * 100;
          return (
            <div
              key={i}
              className="relative group flex items-center justify-between px-3 text-xs font-medium text-white transition-all duration-300"
              style={{
                backgroundColor: l.color,
                height: `${pct}%`,
                minHeight: pct > 0 ? 18 : 0,
              }}
              title={`${l.label}: ${fmtMoney(l.amount)} (${pct.toFixed(1)}%)`}
            >
              <span className="truncate pr-1 drop-shadow-sm">{l.label}</span>
              <span className="font-mono drop-shadow-sm">
                {fmtMoney(l.amount)} ({pct.toFixed(0)}%)
              </span>
            </div>
          );
        })}
      </div>
      <div className="text-xs text-navySoft mt-1 text-right font-mono">
        Total {fmtMoney(total)}
      </div>
    </div>
  );
}

function buildLayers(
  stack: Tranche[],
  balances: Record<TrancheId, number>,
  equity: number,
  equityColor = "#3DAA66"
) {
  const layers: { label: string; amount: number; color: string }[] = [];
  for (const t of stack) {
    if (!t.enabled) continue;
    const amt = balances[t.id];
    if (amt > 0.01) {
      layers.push({ label: t.label, amount: amt, color: t.color });
    }
  }
  layers.push({ label: "Equity", amount: equity, color: equityColor });
  return layers;
}

export function CapitalStackPanel() {
  const inputs = useDealStore((s) => s.inputs);
  const outputs = useDealStore((s) => s.outputs);

  // Year 0 balances = original tranche amounts.
  const y0Balances = {} as Record<TrancheId, number>;
  for (const t of inputs.stack) {
    y0Balances[t.id] = t.enabled ? t.amount : 0;
  }
  const y0Equity =
    inputs.equity.sponsor + inputs.equity.mgmt + inputs.equity.newEquity;
  const y0Layers = buildLayers(inputs.stack, y0Balances, y0Equity);
  const y0Total = y0Layers.reduce((s, l) => s + l.amount, 0);

  const exitRow = outputs.years.at(-1);
  const exitLayers = buildLayers(
    inputs.stack,
    exitRow?.trancheBalances ?? ({} as any),
    Math.max(0, outputs.exit.equityValue)
  );
  const exitTotal = exitLayers.reduce((s, l) => s + l.amount, 0);

  return (
    <div className="fin-card h-full flex flex-col">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="fin-header">Capital Stack</h3>
        <span className="text-xs text-navySoft">close → exit</span>
      </div>
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        <StackBar title="At Close" layers={y0Layers} total={y0Total} />
        <StackBar title={`At Exit (Yr ${outputs.exit.year})`} layers={exitLayers} total={exitTotal} />
      </div>
      <div className="mt-3 text-xs text-navySoft border-t border-senior-100 pt-2">
        Watch the senior debt shrink and the equity slice grow as the deal delevers
        and the business compounds. Junior tranches that accrete (PIK mezz) grow before
        getting wiped at maturity.
      </div>
    </div>
  );
}
