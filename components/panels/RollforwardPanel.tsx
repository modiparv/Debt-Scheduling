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

  const data = outputs.years.map((row) => {
    const point: Record<string, number> = { year: row.year, leverage: row.leverageRatio };
    for (const t of activeTranches) {
      point[t.id] = row.trancheBalances[t.id as TrancheId];
    }
    return point;
  });

  const y0: Record<string, number> = { year: 0, leverage: 0 };
  for (const t of activeTranches) y0[t.id] = t.amount;
  data.unshift(y0);

  return (
    <div className="fin-card h-full flex flex-col">
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <h3 className="fin-header text-2xl">Tranche Rollforward</h3>
          <p className="text-[11px] text-mid mt-1">
            Balances year-by-year. Leverage (dashed) on the right axis.
          </p>
        </div>
        <span className="fin-eyebrow">close → exit</span>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 40, left: 8, bottom: 8 }}>
            <CartesianGrid stroke="#F5F5F5" vertical={false} />
            <XAxis
              dataKey="year"
              stroke="#757575"
              fontSize={11}
              axisLine={{ stroke: "#E0E0E0" }}
              tickLine={false}
              tick={{ fill: "#757575" }}
              label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 10, fill: "#8C8C8C" }}
            />
            <YAxis
              yAxisId="left"
              stroke="#757575"
              fontSize={11}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#757575" }}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#757575"
              fontSize={11}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#757575" }}
              tickFormatter={(v) => `${v.toFixed(1)}x`}
            />
            <Tooltip
              cursor={{ stroke: "#E0E0E0" }}
              contentStyle={{
                fontSize: 11,
                border: "1px solid #E0E0E0",
                borderRadius: 6,
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
              labelStyle={{ color: "#757575", fontWeight: 500 }}
              formatter={(value: any, name: any) =>
                name === "Leverage"
                  ? [fmtMult(Number(value)), "Leverage"]
                  : [fmtMoney(Number(value)), String(name)]
              }
            />
            <Legend
              wrapperStyle={{ fontSize: 10, color: "#757575", paddingTop: 8 }}
              iconType="line"
            />
            {activeTranches.map((t) => (
              <Line
                key={t.id}
                type="monotone"
                dataKey={t.id}
                name={t.label}
                stroke={t.color}
                strokeWidth={1.75}
                dot={false}
                yAxisId="left"
                animationDuration={400}
              />
            ))}
            <Line
              type="monotone"
              dataKey="leverage"
              name="Leverage"
              stroke="#1A1A1A"
              strokeWidth={2}
              strokeDasharray="4 3"
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
