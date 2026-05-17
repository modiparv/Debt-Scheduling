"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useDealStore } from "@/lib/store";
import { fmtMoney, fmtPct, classNames } from "@/lib/format";
import type { TrancheId, YearRow, Tranche } from "@/lib/types";

const NICE_LABELS: Record<TrancheId, string> = {
  existing: "Existing",
  revolver: "Revolver",
  tla: "TLA",
  tlb: "TLB",
  sr_notes: "Senior Notes",
  sub_notes: "Sub Notes",
  mezz: "Mezzanine",
  seller: "Seller",
  preferred: "Preferred",
};

interface FlowItem {
  label: string;
  amount: number;
  color: string;
  trancheId?: TrancheId;
}

// A horizontal proportional bar — one box per item, sized by share of `scale`.
function ProportionalBar({
  items,
  scale,
  height = 28,
}: {
  items: FlowItem[];
  scale: number;
  height?: number;
}) {
  const safeScale = scale || 1;
  return (
    <div className="flex w-full rounded-md overflow-hidden border border-silver" style={{ height }}>
      {items.map((it, i) => {
        const pct = Math.max(0, (Math.abs(it.amount) / safeScale) * 100);
        if (pct < 0.5) return null;
        return (
          <div
            key={i}
            title={`${it.label}: ${fmtMoney(it.amount)}`}
            className="relative flex items-center justify-center text-[10px] text-white font-medium overflow-hidden transition-all duration-500 hover:brightness-110"
            style={{
              width: `${pct}%`,
              backgroundColor: it.color,
            }}
          >
            <span className="truncate px-1.5">
              {pct > 8 ? `${it.label}` : ""}
              {pct > 18 ? ` · ${fmtMoney(it.amount)}` : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function FlowStep({
  index,
  title,
  amount,
  accent,
  bar,
  note,
  arrowDown = true,
}: {
  index: string;
  title: string;
  amount?: number;
  accent: string;
  bar: ReactNode;
  note?: ReactNode;
  arrowDown?: boolean;
}) {
  return (
    <div className="relative">
      <div className="flex items-baseline gap-3 mb-2">
        <span
          className="font-serif text-xl leading-none"
          style={{ color: accent }}
        >
          {index}
        </span>
        <div className="flex-1 flex items-baseline justify-between">
          <span className="text-[12px] font-medium text-ink tracking-tight">
            {title}
          </span>
          {typeof amount === "number" && (
            <span className="text-[12px] font-mono tabular-nums text-ink">
              {fmtMoney(amount)}
            </span>
          )}
        </div>
      </div>
      {bar}
      {note && <div className="text-[11px] text-mid mt-2">{note}</div>}
      {arrowDown && (
        <div className="flex justify-center my-3">
          <div className="text-mid text-lg leading-none" aria-hidden>↓</div>
        </div>
      )}
    </div>
  );
}

export function WaterfallPanel() {
  const outputs = useDealStore((s) => s.outputs);
  const inputs = useDealStore((s) => s.inputs);
  const [year, setYear] = useState(1);

  const maxYear = outputs.years.length;
  const yr = Math.min(Math.max(1, year), maxYear);
  const row: YearRow | undefined = outputs.years[yr - 1];
  if (!row) return null;

  const cashIn = yr === 1 ? inputs.startingCash : outputs.years[yr - 2].endingCash;
  const cashAvail = cashIn + row.preFinancing;
  const cashAfterMandatory = cashAvail - row.mandatoryAmort + row.revolverDraw;

  const trancheById = new Map<TrancheId, Tranche>();
  inputs.stack.forEach((t) => trancheById.set(t.id, t));

  // Build per-step flow items.
  const generationItems: FlowItem[] = [
    row.cfo > 0 && { label: "CFO", amount: row.cfo, color: "#3F4F7A" },
    row.cfi !== 0 && { label: "Capex", amount: -row.cfi, color: "#8A95B0" },
    cashIn > 0 && { label: "Opening cash", amount: cashIn, color: "#D9DEE9" },
  ].filter(Boolean) as FlowItem[];

  const mandatoryItems: FlowItem[] = [];
  const sweepItems: FlowItem[] = [];
  for (const t of inputs.stack) {
    if (!t.enabled) continue;
    const m = row.trancheMandatory[t.id];
    const o = row.trancheOptional[t.id];
    if (m > 0.01) mandatoryItems.push({ label: NICE_LABELS[t.id], amount: m, color: t.color, trancheId: t.id });
    if (o > 0.01) sweepItems.push({ label: NICE_LABELS[t.id], amount: o, color: t.color, trancheId: t.id });
  }

  // Use the largest single value as the bar scale so all bars are comparable
  // within the same year. Cash available is usually the biggest.
  const scale = Math.max(cashAvail, row.mandatoryAmort, row.sweepPool, row.endingCash, 1);

  return (
    <div className="fin-card h-full flex flex-col overflow-hidden">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h3 className="fin-header text-2xl">Cash Waterfall · Year {yr}</h3>
          <p className="text-[11px] text-mid mt-1">
            Drag the year scrubber to walk through the hold. Each bar is sized
            relative to the year&rsquo;s peak flow.
          </p>
        </div>
        <span className="fin-eyebrow">cascade · senior → junior</span>
      </div>

      <div className="mb-5">
        <input
          type="range"
          min={1}
          max={maxYear}
          step={1}
          value={yr}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-mid mt-1 font-mono tabular-nums">
          {outputs.years.map((r) => (
            <span
              key={r.year}
              className={r.year === yr ? "text-ink font-semibold" : ""}
            >
              {r.year}
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-y-auto flex-1 pr-1">
        <FlowStep
          index="①"
          title="Cash generated this year"
          amount={cashAvail}
          accent="#3F4F7A"
          bar={<ProportionalBar items={generationItems} scale={scale} />}
          note={`From operations ${fmtMoney(row.cfo)} · less capex ${fmtMoney(-row.cfi)} · plus opening cash ${fmtMoney(cashIn)}`}
        />

        <FlowStep
          index="②"
          title="Mandatory amortization (no choice)"
          amount={-row.mandatoryAmort}
          accent="#1F2A4A"
          bar={
            mandatoryItems.length > 0 ? (
              <ProportionalBar items={mandatoryItems} scale={scale} />
            ) : (
              <EmptyBar label="No scheduled amort this year." />
            )
          }
        />

        <FlowStep
          index="③"
          title={row.revolverDraw > 0 ? "Revolver drawn — cash shortfall" : "Cash after mandatory"}
          amount={row.revolverDraw > 0 ? row.revolverDraw : cashAfterMandatory}
          accent={row.revolverDraw > 0 ? "#8C6F1F" : "#3F4F7A"}
          bar={
            row.revolverDraw > 0 ? (
              <ProportionalBar
                items={[{ label: "Revolver draw", amount: row.revolverDraw, color: "#8C6F1F" }]}
                scale={scale}
              />
            ) : (
              <ProportionalBar
                items={[{ label: "Remaining cash", amount: cashAfterMandatory, color: "#3F4F7A" }]}
                scale={scale}
              />
            )
          }
          note={
            row.revolverDraw > 0
              ? "Operating cash didn't cover mandatory amort. The revolver topped up to the minimum balance."
              : `${fmtMoney(cashAfterMandatory)} left, minimum cash ${fmtMoney(inputs.exit.minCash)}.`
          }
        />

        <FlowStep
          index="④"
          title={`Optional sweep · ${fmtPct(inputs.exit.sweepPct)} of excess`}
          amount={-row.sweepPool}
          accent="#B89A3C"
          bar={
            sweepItems.length > 0 ? (
              <ProportionalBar items={sweepItems} scale={scale} />
            ) : (
              <EmptyBar label="No sweep this year." />
            )
          }
          note={
            row.sweepPool > 0
              ? `Excess cash paid down debt in seniority order: ${sweepItems
                  .map((i) => `${i.label} ${fmtMoney(i.amount)}`)
                  .join(" · ")}`
              : "Either sweep % is 0 or there was no excess cash to sweep."
          }
        />

        <FlowStep
          index="⑤"
          title="Where the year ended"
          accent="#1A1A1A"
          arrowDown={false}
          bar={
            <div className="grid grid-cols-3 gap-3 mt-1">
              <EndCell label="Ending cash" value={row.endingCash} accent="#3F4F7A" />
              <EndCell label="Total debt" value={row.totalDebt} accent="#1A1A1A" />
              <EndCell
                label="Leverage"
                value={row.leverageRatio}
                accent="#B89A3C"
                suffix="x"
                isMultiple
              />
            </div>
          }
        />
      </div>
    </div>
  );
}

function EmptyBar({ label }: { label: string }) {
  return (
    <div className="w-full h-7 rounded-md border border-dashed border-silver flex items-center justify-center text-[10px] text-mid italic">
      {label}
    </div>
  );
}

function EndCell({
  label,
  value,
  accent,
  suffix = "",
  isMultiple = false,
}: {
  label: string;
  value: number;
  accent: string;
  suffix?: string;
  isMultiple?: boolean;
}) {
  return (
    <div
      className="rounded-md border border-silver bg-white p-3 text-center"
      style={{ borderLeftColor: accent, borderLeftWidth: 3 }}
    >
      <div className="fin-eyebrow mb-1">{label}</div>
      <div className="font-serif text-xl text-ink tabular-nums">
        {isMultiple
          ? `${value.toFixed(2)}${suffix}`
          : fmtMoney(value)}
      </div>
    </div>
  );
}
