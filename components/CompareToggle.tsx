"use client";

import { useDealStore } from "@/lib/store.ts";
import { fmtPct, fmtMult, fmtMoney, classNames } from "@/lib/format.ts";

export function CompareToggle() {
  const compareMode = useDealStore((s) => s.compareMode);
  const baseline = useDealStore((s) => s.baseline);
  const baselineOutputs = useDealStore((s) => s.baselineOutputs);
  const outputs = useDealStore((s) => s.outputs);
  const snapshot = useDealStore((s) => s.snapshotBaseline);
  const clear = useDealStore((s) => s.clearBaseline);

  return (
    <div className="flex items-center gap-3">
      {!compareMode ? (
        <button
          onClick={snapshot}
          className="px-3 py-1 rounded text-xs font-semibold bg-navy text-white hover:bg-navySoft transition"
        >
          Snapshot as Baseline
        </button>
      ) : (
        <>
          <div className="text-xs text-navySoft">
            <span className="font-semibold text-navy">Compare ON</span> — baseline
            held at IRR {fmtPct(baselineOutputs?.sponsorIRR ?? NaN)} ·{" "}
            {fmtMult(baselineOutputs?.sponsorMOIC ?? NaN)} ·{" "}
            {fmtMoney(baselineOutputs?.exit.equityValue ?? 0)}
          </div>
          <button
            onClick={clear}
            className="px-3 py-1 rounded text-xs font-semibold bg-white border border-senior-300 text-navy hover:bg-senior-50"
          >
            Clear
          </button>
        </>
      )}
    </div>
  );
}

export function CompareDelta() {
  const compareMode = useDealStore((s) => s.compareMode);
  const baseline = useDealStore((s) => s.baselineOutputs);
  const outputs = useDealStore((s) => s.outputs);

  if (!compareMode || !baseline) return null;

  const dIrr = outputs.sponsorIRR - baseline.sponsorIRR;
  const dMoic = outputs.sponsorMOIC - baseline.sponsorMOIC;
  const dEq = outputs.exit.equityValue - baseline.exit.equityValue;
  const tone = (n: number) =>
    Math.abs(n) < 1e-9 ? "text-navySoft" : n > 0 ? "text-equity-700" : "text-junior-700";

  return (
    <div className="fin-card border-l-4 border-l-navy">
      <div className="fin-label mb-1">Versus Baseline</div>
      <div className="flex justify-around text-center">
        <div>
          <div className="fin-label">ΔIRR</div>
          <div className={classNames("text-lg font-mono font-bold", tone(dIrr))}>
            {(dIrr * 100).toFixed(1)}pp
          </div>
        </div>
        <div>
          <div className="fin-label">ΔMOIC</div>
          <div className={classNames("text-lg font-mono font-bold", tone(dMoic))}>
            {dMoic >= 0 ? "+" : ""}
            {dMoic.toFixed(2)}x
          </div>
        </div>
        <div>
          <div className="fin-label">ΔEquity</div>
          <div className={classNames("text-lg font-mono font-bold", tone(dEq))}>
            {dEq >= 0 ? "+" : ""}
            {fmtMoney(dEq)}
          </div>
        </div>
      </div>
    </div>
  );
}
