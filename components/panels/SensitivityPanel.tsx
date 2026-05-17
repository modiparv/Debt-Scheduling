"use client";

import { useMemo } from "react";
import { useDealStore } from "@/lib/store";
import { buildSensitivityGrid } from "@/lib/lbo-engine";
import { fmtPct, fmtMult, classNames } from "@/lib/format";

// Colour an IRR cell from junior-bronze (low) → champagne (mid) → ink (high)
// on a smooth gradient so the eye reads the slope of the surface.
function cellShade(irr: number): { bg: string; fg: string } {
  if (!Number.isFinite(irr)) return { bg: "#F5F5F5", fg: "#8C8C8C" };
  // Clamp to a 0%-50% IRR scale for shading.
  const t = Math.max(0, Math.min(1, irr / 0.5));
  // Interpolate between #FBF6E7 (low) and #1A1A1A (high)
  const r1 = 0xFB, g1 = 0xF6, b1 = 0xE7;
  const r2 = 0x1A, g2 = 0x1A, b2 = 0x1A;
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  const fg = t > 0.45 ? "#FFFFFF" : "#2B2B2B";
  return { bg: `rgb(${r}, ${g}, ${b})`, fg };
}

export function SensitivityPanel() {
  const inputs = useDealStore((s) => s.inputs);

  const grid = useMemo(() => buildSensitivityGrid(inputs), [inputs]);
  const { multipleAxis, yearAxis, irrs } = grid;
  const baseMult = inputs.exit.exitMultiple;
  const baseYr = inputs.exit.exitYear;

  return (
    <div className="fin-card h-full flex flex-col">
      <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fin-header text-2xl">Sensitivity / Scenario Analysis</h3>
          <p className="text-[11px] text-mid mt-1">
            Sponsor IRR across exit multiple (rows) × exit year (cols). The
            current deal is outlined in ink.
          </p>
        </div>
        <span className="fin-eyebrow">heatmap · darker = higher IRR</span>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr>
              <th className="text-left fin-eyebrow font-medium py-2 pr-3">
                Exit Multiple ↓ · Year →
              </th>
              {yearAxis.map((yr) => (
                <th
                  key={yr}
                  className={classNames(
                    "text-center fin-eyebrow font-medium py-2 px-2",
                    yr === baseYr && "text-ink"
                  )}
                >
                  Yr {yr}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {multipleAxis.map((mult, mi) => (
              <tr key={mult}>
                <td
                  className={classNames(
                    "py-2 pr-3 font-mono tabular-nums",
                    Math.abs(mult - baseMult) < 1e-9 ? "text-ink font-semibold" : "text-mid"
                  )}
                >
                  {fmtMult(mult)}
                </td>
                {yearAxis.map((yr, yi) => {
                  const irr = irrs[mi][yi];
                  const { bg, fg } = cellShade(irr);
                  const isBase =
                    Math.abs(mult - baseMult) < 1e-9 &&
                    Math.abs(yr - baseYr) < 1e-9;
                  return (
                    <td
                      key={`${mi}-${yi}`}
                      className={classNames(
                        "text-center font-mono tabular-nums transition-colors",
                        isBase ? "ring-2 ring-ink z-10 relative" : ""
                      )}
                      style={{
                        backgroundColor: bg,
                        color: fg,
                        padding: "10px 8px",
                        minWidth: 64,
                      }}
                    >
                      {fmtPct(irr)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-4 mt-4 border-t border-silver">
        <Legend swatch="#FBF6E7" label="≤ 0% IRR" />
        <Legend swatch="#B89A3C" label="~25% IRR" />
        <Legend swatch="#1A1A1A" label="≥ 50% IRR" />
      </div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px] text-mid">
      <span
        className="inline-block w-4 h-4 rounded-sm border border-silver"
        style={{ backgroundColor: swatch }}
      />
      <span>{label}</span>
    </div>
  );
}
