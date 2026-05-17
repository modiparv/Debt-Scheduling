"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useDealStore } from "@/lib/store";
import { fmtMoney, fmtPct, fmtMult } from "@/lib/format";
import type { TrancheId, YearRow } from "@/lib/types";

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
  amount: number; // positive
  color: string;
}

// Stacked-segment bar that fills the full container width. Each item is sized
// by its share of the step total. Makes small steps just as readable as big ones.
function StepBar({ items, height = 30 }: { items: FlowItem[]; height?: number }) {
  const total = items.reduce((s, it) => s + Math.abs(it.amount), 0);
  if (total <= 0) {
    return (
      <div
        className="w-full rounded-md border border-dashed border-silver flex items-center justify-center text-[10px] text-mid italic"
        style={{ height }}
      >
        — no flow this year —
      </div>
    );
  }
  return (
    <div
      className="flex w-full rounded-md overflow-hidden border border-silver"
      style={{ height }}
    >
      {items.map((it, i) => {
        const pct = (Math.abs(it.amount) / total) * 100;
        return (
          <div
            key={i}
            title={`${it.label}: ${fmtMoney(it.amount)}`}
            className="relative flex items-center justify-center text-[10px] text-white font-medium overflow-hidden transition-all duration-500 hover:brightness-110"
            style={{ width: `${pct}%`, backgroundColor: it.color }}
          >
            <span className="truncate px-1.5">
              {pct > 10 ? it.label : ""}
              {pct > 22 ? ` · ${fmtMoney(it.amount)}` : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Tiny chip strip — shows each item as a labeled chip under the step bar.
function ChipStrip({ items }: { items: FlowItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {items.map((it, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1.5 text-[11px] text-graphite"
        >
          <span
            className="inline-block w-2 h-2 rounded-sm"
            style={{ backgroundColor: it.color }}
          />
          <span>{it.label}</span>
          <span className="font-mono tabular-nums text-mid">{fmtMoney(it.amount)}</span>
        </span>
      ))}
    </div>
  );
}

function Step({
  index,
  title,
  total,
  totalTone = "neutral",
  bar,
  chips,
  note,
  arrow = true,
}: {
  index: string;
  title: string;
  total?: number;
  totalTone?: "neutral" | "positive" | "negative";
  bar: ReactNode;
  chips?: FlowItem[];
  note?: ReactNode;
  arrow?: boolean;
}) {
  const toneClass =
    totalTone === "positive"
      ? "text-ink"
      : totalTone === "negative"
      ? "text-junior-700"
      : "text-ink";
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-xl text-champagneDeep leading-none">
            {index}
          </span>
          <span className="text-[12px] font-medium text-ink tracking-tight">
            {title}
          </span>
        </div>
        {typeof total === "number" && (
          <span className={`text-[12px] font-mono tabular-nums ${toneClass}`}>
            {fmtMoney(total)}
          </span>
        )}
      </div>
      {bar}
      {chips && <ChipStrip items={chips} />}
      {note && <div className="text-[11px] text-mid mt-2">{note}</div>}
      {arrow && (
        <div className="flex justify-center my-3" aria-hidden>
          <div className="text-mid text-lg leading-none">↓</div>
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
  const cashAfterDividends = cashAvail - row.dividendsPaid;
  const cashAfterMandatory =
    cashAfterDividends - row.mandatoryAmort + row.revolverDraw;

  // ① Cash sources
  const sourcesChips: FlowItem[] = [];
  if (row.cfo > 0) sourcesChips.push({ label: "CFO", amount: row.cfo, color: "#3F4F7A" });
  if (row.cfi !== 0) sourcesChips.push({ label: "Capex", amount: -row.cfi, color: "#8A95B0" });
  if (cashIn > 0) sourcesChips.push({ label: "Opening cash", amount: cashIn, color: "#D9DEE9" });

  // ② Dividends
  const divChips: FlowItem[] = [];
  if (row.dividendsPaid > 0)
    divChips.push({ label: "Cash dividends to equity", amount: row.dividendsPaid, color: "#1A1A1A" });

  // ③ Mandatory amortization
  const mandatoryChips: FlowItem[] = [];
  for (const t of inputs.stack) {
    if (!t.enabled) continue;
    const m = row.trancheMandatory[t.id];
    if (m > 0.01) mandatoryChips.push({ label: NICE_LABELS[t.id], amount: m, color: t.color });
  }

  // ⑤ Sweep
  const sweepChips: FlowItem[] = [];
  for (const t of inputs.stack) {
    if (!t.enabled) continue;
    const o = row.trancheOptional[t.id];
    if (o > 0.01) sweepChips.push({ label: NICE_LABELS[t.id], amount: o, color: t.color });
  }

  return (
    <div className="fin-card h-full flex flex-col overflow-hidden">
      <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fin-header text-2xl">Cash Waterfall · Year {yr}</h3>
          <p className="text-[11px] text-mid mt-1">
            Each bar fills 100% of its row, sized by the step&rsquo;s own
            breakdown. Walk through the hold with the year scrubber.
          </p>
        </div>
        <div className="flex gap-4 text-[11px] text-mid font-mono tabular-nums">
          <span>Rev {fmtMoney(row.revenue)}</span>
          <span>EBITDA {fmtMoney(row.ebitda)}</span>
          <span>Lev {fmtMult(row.leverageRatio)}</span>
        </div>
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
        <Step
          index="①"
          title="Cash generated this year"
          total={cashAvail}
          totalTone="positive"
          bar={<StepBar items={sourcesChips} />}
          chips={sourcesChips}
          note={`From operations ${fmtMoney(row.cfo)} · less capex ${fmtMoney(-row.cfi)} · plus opening cash ${fmtMoney(cashIn)}`}
        />

        <Step
          index="②"
          title="Cash dividends to equity"
          total={-row.dividendsPaid}
          totalTone="negative"
          bar={<StepBar items={divChips} />}
          note={
            row.dividendsPaid > 0
              ? `Paid pro-rata to sponsor, mgmt and new equity. This is what makes the IRR work mid-hold.`
              : "No dividend recap scheduled this year."
          }
        />

        <Step
          index="③"
          title="Mandatory amortization (no choice)"
          total={-row.mandatoryAmort}
          totalTone="negative"
          bar={<StepBar items={mandatoryChips} />}
          chips={mandatoryChips}
          note={
            mandatoryChips.length > 0
              ? "Each segment is one tranche's required repayment."
              : "No scheduled amort this year."
          }
        />

        <Step
          index="④"
          title={
            row.revolverDraw > 0
              ? "Revolver drawn — cash shortfall"
              : "Cash after mandatory"
          }
          total={row.revolverDraw > 0 ? row.revolverDraw : cashAfterMandatory}
          totalTone={row.revolverDraw > 0 ? "negative" : "positive"}
          bar={
            <StepBar
              items={
                row.revolverDraw > 0
                  ? [{ label: "Revolver draw", amount: row.revolverDraw, color: "#8C6F1F" }]
                  : [{ label: "Remaining cash", amount: cashAfterMandatory, color: "#3F4F7A" }]
              }
            />
          }
          note={
            row.revolverDraw > 0
              ? "Cash from ops didn't cover dividends + mandatory amort. Revolver topped up to min cash."
              : `${fmtMoney(cashAfterMandatory)} left vs. minimum cash ${fmtMoney(inputs.exit.minCash)}.`
          }
        />

        <Step
          index="⑤"
          title={`Optional sweep · ${fmtPct(inputs.exit.sweepPct)} of excess`}
          total={-row.sweepPool}
          totalTone="negative"
          bar={<StepBar items={sweepChips} />}
          chips={sweepChips}
          note={
            row.sweepPool > 0
              ? "Excess cash pays down debt in seniority order."
              : "No sweep — either sweep % is 0 or there was no excess cash."
          }
        />

        <Step
          index="⑥"
          title="Where the year ended"
          arrow={false}
          bar={
            <div className="grid grid-cols-3 gap-3 mt-1">
              <EndCell label="Ending cash" value={fmtMoney(row.endingCash)} accent="#3F4F7A" />
              <EndCell label="Total debt" value={fmtMoney(row.totalDebt)} accent="#1A1A1A" />
              <EndCell label="Leverage" value={fmtMult(row.leverageRatio)} accent="#B89A3C" />
            </div>
          }
        />
      </div>
    </div>
  );
}

function EndCell({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div
      className="rounded-md border border-silver bg-white p-3 text-center"
      style={{ borderLeftColor: accent, borderLeftWidth: 3 }}
    >
      <div className="fin-eyebrow mb-1">{label}</div>
      <div className="font-serif text-xl text-ink tabular-nums">{value}</div>
    </div>
  );
}
