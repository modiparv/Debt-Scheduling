"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useDealStore } from "@/lib/store";
import { fmtMoney, classNames } from "@/lib/format";
import type { TrancheId, YearRow } from "@/lib/types";

const NICE_LABELS: Record<TrancheId, string> = {
  existing: "Existing Debt",
  revolver: "Revolver",
  tla: "TLA",
  tlb: "TLB",
  sr_notes: "Senior Notes",
  sub_notes: "Sub Notes",
  mezz: "Mezz",
  seller: "Seller",
  preferred: "Preferred",
};

function Row({
  label,
  value,
  tone = "neutral",
  bold = false,
  indent = 0,
}: {
  label: string;
  value: number;
  tone?: "neutral" | "good" | "bad" | "muted";
  bold?: boolean;
  indent?: number;
}) {
  const toneClass =
    tone === "good"
      ? "text-equity-700"
      : tone === "bad"
      ? "text-junior-700"
      : tone === "muted"
      ? "text-navySoft"
      : "text-navy";
  return (
    <div
      className={classNames(
        "flex justify-between items-baseline py-1 px-2 text-sm transition-all duration-300",
        bold && "font-semibold border-t border-senior-100 mt-1 pt-2"
      )}
      style={{ paddingLeft: 8 + indent * 16 }}
    >
      <span className={toneClass}>{label}</span>
      <span className={classNames("font-mono", toneClass)}>{fmtMoney(value)}</span>
    </div>
  );
}

function Bracket({ children, color }: { children: ReactNode; color: string }) {
  return (
    <div
      className="border-l-4 rounded pl-1 my-1"
      style={{ borderLeftColor: color }}
    >
      {children}
    </div>
  );
}

export function WaterfallPanel() {
  const outputs = useDealStore((s) => s.outputs);
  const inputs = useDealStore((s) => s.inputs);
  const [year, setYear] = useState(1);

  const maxYear = outputs.years.length;
  const yr = Math.min(year, maxYear);
  const row: YearRow | undefined = outputs.years[yr - 1];
  if (!row) return null;

  const cashIn = (yr === 1 ? inputs.startingCash : outputs.years[yr - 2].endingCash);
  const cashAvail = cashIn + row.preFinancing;

  const stackById = new Map(inputs.stack.map((t) => [t.id, t]));
  const activeIds = inputs.stack.filter((t) => t.enabled).map((t) => t.id);

  return (
    <div className="fin-card h-full flex flex-col">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="fin-header">Debt Waterfall — Year {yr}</h3>
        <span className="text-xs text-navySoft">scrub the year ↓</span>
      </div>
      <input
        type="range"
        min={1}
        max={maxYear}
        step={1}
        value={yr}
        onChange={(e) => setYear(parseInt(e.target.value))}
        className="w-full accent-senior-500 mb-2"
      />
      <div className="flex justify-between text-xs text-navySoft mb-3">
        {outputs.years.map((r) => (
          <span key={r.year}>{r.year}</span>
        ))}
      </div>

      <div className="overflow-y-auto flex-1 pr-1">
        <Bracket color="#3DAA66">
          <Row label="Cash from operations" value={row.cfo} tone="good" />
          <Row label="Capex (investing)" value={row.cfi} tone="bad" />
          <Row label="Starting cash" value={cashIn} tone="muted" />
          <Row label="Cash available" value={cashAvail} tone="good" bold />
        </Bracket>

        <Bracket color="#1F4DAA">
          <Row label="↓ Block 2: Mandatory amortization" value={-row.mandatoryAmort} bold />
          {activeIds.map((id) => {
            const amt = row.trancheMandatory[id];
            if (amt <= 0.01) return null;
            return (
              <Row
                key={`m-${id}`}
                label={NICE_LABELS[id]}
                value={-amt}
                indent={1}
              />
            );
          })}
        </Bracket>

        <Bracket color={row.revolverDraw > 0 ? "#C25F1A" : "#7AA8F0"}>
          <Row
            label={
              row.revolverDraw > 0
                ? "↓ Block 3: Revolver draw (cash shortfall)"
                : "↓ Block 3: Cash after mandatory"
            }
            value={cashAvail - row.mandatoryAmort + row.revolverDraw}
            tone={row.revolverDraw > 0 ? "bad" : "neutral"}
            bold
          />
          {row.revolverDraw > 0 && (
            <Row label="Draw on revolver" value={row.revolverDraw} tone="bad" indent={1} />
          )}
        </Bracket>

        {row.sweepPool > 0 && (
          <Bracket color="#F08035">
            <Row
              label={`↓ Block 4: Sweep pool (${(inputs.exit.sweepPct * 100).toFixed(0)}% of excess)`}
              value={-row.sweepPool}
              bold
            />
            {activeIds.map((id) => {
              const amt = row.trancheOptional[id];
              if (amt <= 0.01) return null;
              return (
                <Row
                  key={`o-${id}`}
                  label={NICE_LABELS[id]}
                  value={-amt}
                  indent={1}
                />
              );
            })}
          </Bracket>
        )}

        <Bracket color="#0F2A4F">
          <Row label="Ending cash" value={row.endingCash} bold tone="good" />
          <Row label="Total debt remaining" value={row.totalDebt} tone="muted" />
          <Row label="Leverage (Debt / EBITDA)" value={row.leverageRatio} tone="muted" />
        </Bracket>
      </div>
    </div>
  );
}
