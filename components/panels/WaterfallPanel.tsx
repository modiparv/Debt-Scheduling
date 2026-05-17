"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useDealStore } from "@/lib/store";
import { fmtMoney, fmtPct, classNames } from "@/lib/format";
import type { TrancheId, YearRow } from "@/lib/types";

const NICE_LABELS: Record<TrancheId, string> = {
  existing: "Existing Debt",
  revolver: "Revolver",
  tla: "TLA",
  tlb: "TLB",
  sr_notes: "Senior Notes",
  sub_notes: "Sub Notes",
  mezz: "Mezzanine",
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
  tone?: "neutral" | "positive" | "negative" | "muted";
  bold?: boolean;
  indent?: number;
}) {
  const toneClass =
    tone === "positive"
      ? "text-ink"
      : tone === "negative"
      ? "text-junior-700"
      : tone === "muted"
      ? "text-mid"
      : "text-ink";
  return (
    <div
      className={classNames(
        "flex justify-between items-baseline py-1.5 text-[12px] transition-all duration-300",
        bold && "font-medium border-t border-silver/60 mt-1 pt-2"
      )}
      style={{ paddingLeft: indent * 16 }}
    >
      <span className={toneClass}>{label}</span>
      <span className={classNames("font-mono tabular-nums", toneClass)}>
        {fmtMoney(value)}
      </span>
    </div>
  );
}

function Block({ title, children, accent }: { title: ReactNode; children: ReactNode; accent: string }) {
  return (
    <div className="mb-4">
      <div
        className="text-[10px] uppercase tracking-wider2 font-medium mb-1 pb-1 border-b"
        style={{ color: accent, borderColor: accent + "33" }}
      >
        {title}
      </div>
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

  const cashIn = yr === 1 ? inputs.startingCash : outputs.years[yr - 2].endingCash;
  const cashAvail = cashIn + row.preFinancing;
  const activeIds = inputs.stack.filter((t) => t.enabled).map((t) => t.id);

  return (
    <div className="fin-card h-full flex flex-col">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h3 className="fin-header text-2xl">Debt Waterfall</h3>
          <p className="text-[11px] text-mid mt-1">
            Year {yr} of {maxYear} · drag the scrubber to step through the hold.
          </p>
        </div>
        <span className="fin-eyebrow">cascade · senior → junior</span>
      </div>

      <div className="mb-4">
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
            <span key={r.year}>{r.year}</span>
          ))}
        </div>
      </div>

      <div className="overflow-y-auto flex-1 pr-1 grid grid-cols-1 md:grid-cols-2 gap-x-8">
        <div>
          <Block title="① Cash generation" accent="#3F4F7A">
            <Row label="Cash from operations" value={row.cfo} />
            <Row label="Capex (investing)" value={row.cfi} tone="negative" />
            <Row label="Opening cash" value={cashIn} tone="muted" />
            <Row label="Cash available" value={cashAvail} bold />
          </Block>

          <Block title="② Mandatory amortization" accent="#1F2A4A">
            {activeIds.map((id) => {
              const amt = row.trancheMandatory[id];
              if (amt <= 0.01) return null;
              return (
                <Row
                  key={`m-${id}`}
                  label={NICE_LABELS[id]}
                  value={-amt}
                  indent={1}
                  tone="negative"
                />
              );
            })}
            {row.mandatoryAmort === 0 && (
              <div className="text-[11px] text-mid italic py-1">No scheduled amort this year.</div>
            )}
            <Row label="Total mandatory" value={-row.mandatoryAmort} bold />
          </Block>
        </div>

        <div>
          <Block
            title="③ Revolver gate"
            accent={row.revolverDraw > 0 ? "#8C6F1F" : "#3F4F7A"}
          >
            <Row
              label="Cash after mandatory"
              value={cashAvail - row.mandatoryAmort + row.revolverDraw}
              bold
            />
            {row.revolverDraw > 0 ? (
              <Row label="Revolver drawn to top up min cash" value={row.revolverDraw} tone="negative" indent={1} />
            ) : (
              <div className="text-[11px] text-mid italic py-1">No revolver draw — cash surplus.</div>
            )}
          </Block>

          {row.sweepPool > 0 ? (
            <Block
              title={`④ Optional sweep · ${fmtPct(inputs.exit.sweepPct)} of excess`}
              accent="#B89A3C"
            >
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
              <Row label="Total swept" value={-row.sweepPool} bold />
            </Block>
          ) : (
            <Block title="④ Optional sweep" accent="#B89A3C">
              <div className="text-[11px] text-mid italic py-1">
                No sweep — sweep % is 0 or no excess cash.
              </div>
            </Block>
          )}

          <Block title="⑤ Period end" accent="#1A1A1A">
            <Row label="Ending cash" value={row.endingCash} bold />
            <Row label="Total debt remaining" value={row.totalDebt} tone="muted" />
            <Row label="Leverage (Debt / EBITDA)" value={row.leverageRatio} tone="muted" />
          </Block>
        </div>
      </div>
    </div>
  );
}
