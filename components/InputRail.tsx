"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useDealStore } from "@/lib/store";
import { Slider, NumberInput } from "./NumberInput";
import { fmtMoney, fmtPct, fmtMult, classNames } from "@/lib/format";
import type { Tranche } from "@/lib/types";

function Accordion({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-silver/70">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex justify-between items-center py-3 px-5 hover:bg-platinum transition-colors"
      >
        <span className="fin-eyebrow">{title}</span>
        <span className="text-mid text-[10px]">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="px-5 pb-5 pt-1 space-y-4">{children}</div>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="fin-label">{label}</span>
      {children}
    </label>
  );
}

function TrancheCard({ tranche }: { tranche: Tranche }) {
  const toggle = useDealStore((s) => s.toggleTranche);
  const patch = useDealStore((s) => s.patchTranche);

  return (
    <div
      className={classNames(
        "border-l-[3px] rounded-r border-y border-r border-silver/70 bg-white p-3 transition-opacity",
        !tranche.enabled && "opacity-50"
      )}
      style={{ borderLeftColor: tranche.color }}
    >
      <div className="flex items-center justify-between mb-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={tranche.enabled}
            onChange={(e) => toggle(tranche.id, e.target.checked)}
            className="accent-ink"
          />
          <span className="text-[12px] text-ink font-medium">{tranche.label}</span>
        </label>
        <span className="text-[11px] text-mid font-mono tabular-nums">
          {fmtMoney(tranche.amount)}
        </span>
      </div>

      {tranche.enabled && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Field label="Amount">
            <NumberInput
              value={tranche.amount}
              onChange={(n) => patch(tranche.id, { amount: n })}
              step={5}
              min={0}
            />
          </Field>
          <Field label="Coupon">
            <NumberInput
              value={tranche.coupon * 100}
              onChange={(n) => patch(tranche.id, { coupon: n / 100 })}
              step={0.25}
              min={0}
              max={30}
              suffix="%"
            />
          </Field>
          <Field label="Maturity">
            <NumberInput
              value={tranche.maturity}
              onChange={(n) => patch(tranche.id, { maturity: n })}
              step={1}
              min={1}
              max={20}
              suffix="yrs"
            />
          </Field>
          {tranche.id !== "preferred" && tranche.id !== "revolver" && (
            <Field label="Amort">
              <NumberInput
                value={tranche.amortPct * 100}
                onChange={(n) => patch(tranche.id, { amortPct: n / 100 })}
                step={1}
                min={0}
                max={100}
                suffix="%"
              />
            </Field>
          )}
          {(tranche.id === "mezz" || tranche.id === "sub_notes") && (
            <Field label="PIK yrs">
              <NumberInput
                value={tranche.pikYears}
                onChange={(n) => patch(tranche.id, { pikYears: n })}
                step={1}
                min={0}
                max={10}
              />
            </Field>
          )}
          {(tranche.id === "mezz" ||
            tranche.id === "sub_notes" ||
            tranche.id === "preferred") && (
            <Field label="Eq kicker">
              <NumberInput
                value={tranche.kicker * 100}
                onChange={(n) => patch(tranche.id, { kicker: n / 100 })}
                step={0.5}
                min={0}
                max={25}
                suffix="%"
              />
            </Field>
          )}
          <label className="col-span-2 flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              checked={tranche.prepayable}
              onChange={(e) =>
                patch(tranche.id, { prepayable: e.target.checked })
              }
              className="accent-ink"
            />
            <span className="text-[10px] uppercase tracking-wider2 text-mid">
              Subject to cash sweep
            </span>
          </label>
        </div>
      )}
    </div>
  );
}

export function InputRail() {
  const inputs = useDealStore((s) => s.inputs);
  const outputs = useDealStore((s) => s.outputs);
  const patchOperating = useDealStore((s) => s.patchOperating);
  const patchExit = useDealStore((s) => s.patchExit);
  const patchEquity = useDealStore((s) => s.patchEquity);
  const patchPurchase = useDealStore((s) => s.patchPurchase);
  const patchDividends = useDealStore((s) => s.patchDividends);

  const gap = outputs.gap;
  const balanced = Math.abs(gap) < 1;

  return (
    <aside className="w-full lg:w-[380px] lg:max-w-[380px] shrink-0 bg-white border-r border-silver overflow-y-auto no-print">
      <div className="px-5 py-5 border-b border-silver bg-white">
        <div className="fin-eyebrow mb-2">Sources / Uses</div>
        <div className="flex justify-between items-baseline">
          <span className="text-[13px] font-mono tabular-nums text-ink">
            {fmtMoney(outputs.sourcesTotal)} / {fmtMoney(outputs.usesTotal)}
          </span>
          <span
            className={classNames(
              "text-[11px] font-mono tabular-nums tracking-tight",
              balanced ? "text-ink" : "text-junior-700"
            )}
          >
            {balanced ? "Balanced" : `Gap ${fmtMoney(gap)}`}
          </span>
        </div>
      </div>

      <Accordion title="Deal Setup">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Purchase price ($k)">
            <NumberInput
              value={inputs.purchasePrice}
              onChange={(n) => patchPurchase({ purchasePrice: n })}
              step={25}
              min={0}
            />
          </Field>
          <Field label="Fees ($k)">
            <NumberInput
              value={inputs.fees}
              onChange={(n) => patchPurchase({ fees: n })}
              step={5}
              min={0}
            />
          </Field>
          <Field label="Opening cash ($k)">
            <NumberInput
              value={inputs.startingCash}
              onChange={(n) => patchPurchase({ startingCash: n })}
              step={5}
              min={0}
            />
          </Field>
          <Field label="Revolver limit ($k)">
            <NumberInput
              value={inputs.revolverLimit ?? 0}
              onChange={(n) => patchPurchase({ revolverLimit: n })}
              step={50}
              min={0}
            />
          </Field>
          <Field label="NOL balance ($k)">
            <NumberInput
              value={inputs.nolBalance ?? 0}
              onChange={(n) => patchPurchase({ nolBalance: n })}
              step={5}
              min={0}
            />
          </Field>
        </div>
        <div className="pt-3 mt-3 border-t border-silver/70">
          <div className="fin-eyebrow mb-3">Dividend recap (paid to common equity)</div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Common div Y1 ($k)">
              <NumberInput
                value={inputs.dividends?.commonDivY1 ?? 0}
                onChange={(n) => patchDividends({ commonDivY1: n })}
                step={0.5}
                min={0}
              />
            </Field>
            <Field label="Annual growth (%)">
              <NumberInput
                value={(inputs.dividends?.commonDivGrowth ?? 0) * 100}
                onChange={(n) => patchDividends({ commonDivGrowth: n / 100 })}
                step={0.5}
                min={-20}
                max={50}
                suffix="%"
              />
            </Field>
          </div>
        </div>
      </Accordion>

      <Accordion title="Operating Drivers">
        <Slider
          label="Revenue growth"
          value={inputs.operating.revenueGrowth}
          onChange={(n) => patchOperating({ revenueGrowth: n })}
          min={-0.1}
          max={0.25}
          step={0.005}
          format={fmtPct}
        />
        <Slider
          label="EBITDA margin (Y1)"
          value={inputs.operating.ebitdaMargin}
          onChange={(n) => patchOperating({ ebitdaMargin: n })}
          min={0.05}
          max={0.5}
          step={0.005}
          format={fmtPct}
        />
        <Slider
          label="Margin trajectory (Δ / yr)"
          value={inputs.operating.marginTrajectory}
          onChange={(n) => patchOperating({ marginTrajectory: n })}
          min={-0.02}
          max={0.02}
          step={0.001}
          format={(n) => `${n >= 0 ? "+" : ""}${(n * 100).toFixed(1)}%`}
        />
        <Slider
          label="CapEx % of revenue"
          value={inputs.operating.capexPct}
          onChange={(n) => patchOperating({ capexPct: n })}
          min={0}
          max={0.2}
          step={0.005}
          format={fmtPct}
        />
        <Slider
          label="NWC % of revenue"
          value={inputs.operating.nwcPct}
          onChange={(n) => patchOperating({ nwcPct: n })}
          min={0}
          max={0.3}
          step={0.005}
          format={fmtPct}
        />
        <Slider
          label="Tax rate"
          value={inputs.operating.taxRate}
          onChange={(n) => patchOperating({ taxRate: n })}
          min={0}
          max={0.4}
          step={0.005}
          format={fmtPct}
        />
        <Field label="Starting revenue">
          <NumberInput
            value={inputs.operating.revenueY1}
            onChange={(n) => patchOperating({ revenueY1: n })}
            step={50}
            min={0}
          />
        </Field>
      </Accordion>

      <Accordion title="Capital Stack">
        <div className="space-y-2">
          {inputs.stack.map((t) => (
            <TrancheCard key={t.id} tranche={t} />
          ))}
        </div>
        <div className="pt-3 space-y-3 border-t border-silver/70 mt-3">
          <div className="fin-eyebrow">Equity</div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sponsor">
              <NumberInput
                value={inputs.equity.sponsor}
                onChange={(n) => patchEquity({ sponsor: n })}
                step={10}
                min={0}
              />
            </Field>
            <Field label="Management">
              <NumberInput
                value={inputs.equity.mgmt}
                onChange={(n) => patchEquity({ mgmt: n })}
                step={5}
                min={0}
              />
            </Field>
            <Field label="New equity">
              <NumberInput
                value={inputs.equity.newEquity}
                onChange={(n) => patchEquity({ newEquity: n })}
                step={5}
                min={0}
              />
            </Field>
            <Field label="Mgmt pool">
              <NumberInput
                value={inputs.equity.mgmtPool * 100}
                onChange={(n) => patchEquity({ mgmtPool: n / 100 })}
                step={0.5}
                min={0}
                max={25}
                suffix="%"
              />
            </Field>
          </div>
        </div>
      </Accordion>

      <Accordion title="Exit Assumptions">
        <Slider
          label="Exit year"
          value={inputs.exit.exitYear}
          onChange={(n) => patchExit({ exitYear: Math.round(n) })}
          min={3}
          max={10}
          step={1}
          format={(n) => `Year ${Math.round(n)}`}
        />
        <Slider
          label="Exit EBITDA multiple"
          value={inputs.exit.exitMultiple}
          onChange={(n) => patchExit({ exitMultiple: n })}
          min={4}
          max={15}
          step={0.25}
          format={fmtMult}
        />
        <Slider
          label="Cash sweep"
          value={inputs.exit.sweepPct}
          onChange={(n) => patchExit({ sweepPct: n })}
          min={0}
          max={1}
          step={0.05}
          format={fmtPct}
        />
        <Field label="Minimum cash">
          <NumberInput
            value={inputs.exit.minCash}
            onChange={(n) => patchExit({ minCash: n })}
            step={5}
            min={0}
          />
        </Field>
      </Accordion>
    </aside>
  );
}
