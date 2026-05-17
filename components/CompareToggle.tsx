"use client";

import { useDealStore } from "@/lib/store";
import { fmtPct, fmtMult, fmtMoney, classNames } from "@/lib/format";

export function CompareToggle() {
  const compareMode = useDealStore((s) => s.compareMode);
  const baselineOutputs = useDealStore((s) => s.baselineOutputs);
  const snapshot = useDealStore((s) => s.snapshotBaseline);
  const clear = useDealStore((s) => s.clearBaseline);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {!compareMode ? (
        <button
          onClick={snapshot}
          className="text-[11px] uppercase tracking-wider2 text-ink border border-ink px-3 py-1 rounded-full hover:bg-ink hover:text-white transition-colors"
        >
          Snapshot baseline
        </button>
      ) : (
        <>
          <div className="text-[11px] text-mid">
            <span className="text-ink font-medium">Compare on</span> · baseline{" "}
            <span className="font-mono tabular-nums">
              {fmtPct(baselineOutputs?.sponsorIRR ?? NaN)} ·{" "}
              {fmtMult(baselineOutputs?.sponsorMOIC ?? NaN)} ·{" "}
              {fmtMoney(baselineOutputs?.exit.equityValue ?? 0)}
            </span>
          </div>
          <button
            onClick={clear}
            className="text-[11px] uppercase tracking-wider2 text-mid border border-silver px-3 py-1 rounded-full hover:text-ink hover:border-mid transition-colors"
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

  if (!compareMode || !baseline) {
    return (
      <div className="fin-card flex flex-col justify-center items-center text-center min-h-[120px]">
        <div className="fin-eyebrow mb-2">Compare mode</div>
        <p className="text-[12px] text-mid leading-relaxed max-w-[220px]">
          Snapshot the current deal to see ΔIRR · ΔMOIC · ΔEquity as you edit.
        </p>
      </div>
    );
  }

  const dIrr = outputs.sponsorIRR - baseline.sponsorIRR;
  const dMoic = outputs.sponsorMOIC - baseline.sponsorMOIC;
  const dEq = outputs.exit.equityValue - baseline.exit.equityValue;
  const tone = (n: number) =>
    Math.abs(n) < 1e-9 ? "text-mid" : n > 0 ? "text-ink" : "text-junior-700";
  const sign = (n: number) => (n >= 0 ? "+" : "");

  return (
    <div className="fin-card border-l-[3px] border-l-ink">
      <div className="fin-eyebrow mb-3">Versus baseline</div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="fin-eyebrow">ΔIRR</div>
          <div className={classNames("font-serif text-2xl tabular-nums mt-1", tone(dIrr))}>
            {sign(dIrr)}
            {(dIrr * 100).toFixed(1)}pp
          </div>
        </div>
        <div>
          <div className="fin-eyebrow">ΔMOIC</div>
          <div className={classNames("font-serif text-2xl tabular-nums mt-1", tone(dMoic))}>
            {sign(dMoic)}
            {dMoic.toFixed(2)}x
          </div>
        </div>
        <div>
          <div className="fin-eyebrow">ΔEquity</div>
          <div className={classNames("font-serif text-2xl tabular-nums mt-1", tone(dEq))}>
            {sign(dEq)}
            {fmtMoney(dEq)}
          </div>
        </div>
      </div>
    </div>
  );
}
