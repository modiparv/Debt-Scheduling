"use client";

import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useDealStore } from "@/lib/store";
import { fmtMoney, fmtMult } from "@/lib/format";
import type { TrancheId } from "@/lib/types";

export function RollforwardPanel() {
  const inputs = useDealStore((s) => s.inputs);
  const outputs = useDealStore((s) => s.outputs);

  const activeTranches = inputs.stack.filter((t) => t.enabled);

  // Build chart data: one point per year, balance per tranche + leverage.
  const data = outputs.years.map((row) => {
    const point: Record<string, number> = { year: row.year, leverage: row.leverageRatio };
    for (const t of activeTranches) {
      point[t.id] = row.trancheBalances[t.id as TrancheId];
    }
    return point;
  });

  // Add Y0 starting point.
  const y0: Record<string, number> = { year: 0, leverage: 0 };
  for (const t of activeTranches) y0[t.id] = t.amount;
  data.unshift(y0);

  return (
    <div className="fin-card h-full flex flex-col">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="fin-header">Tranche Balance Rollforward</h3>
        <span className="text-xs text-navySoft">balances ↘ · leverage —</span>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid stroke="#E8F0FE" />
            <XAxis dataKey="year" stroke="#1B3B6B" fontSize={11} />
            <YAxis
              yAxisId="left"
              stroke="#1B3B6B"
              fontSize={11}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#0B1F3A"
              fontSize={11}
              tickFormatter={(v) => `${v.toFixed(1)}x`}
            />
            <Tooltip
              formatter={(value: any, name: any) =>
                name === "leverage"
                  ? [fmtMult(Number(value)), "Leverage"]
                  : [fmtMoney(Number(value)), String(name)]
              }
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {activeTranches.map((t) => (
              <Line
                key={t.id}
                type="monotone"
                dataKey={t.id}
                name={t.label}
                stroke={t.color}
                strokeWidth={2}
                dot={false}
                yAxisId="left"
                animationDuration={400}
              />
            ))}
            <Line
              type="monotone"
              dataKey="leverage"
              name="Leverage"
              stroke="#0B1F3A"
              strokeWidth={2.5}
              strokeDasharray="6 4"
              dot={false}
              yAxisId="right"
              animationDuration={400}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
