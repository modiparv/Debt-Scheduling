"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useDealStore } from "@/lib/store";
import { Slider, NumberInput } from "./NumberInput";
import { fmtMoney, fmtPct, fmtMult, classNames } from "@/lib/format";
import type { Tranche, TrancheId } from "@/lib/types";

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
    <div className="border-b border-senior-100">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex justify-between items-center py-3 px-4 hover:bg-senior-50"
      >
        <span className="fin-header text-sm">{title}</span>
        <span className="text-navySoft text-xs">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

function TrancheCard({ tranche }: { tranche: Tranche }) {
  const toggle = useDealStore((s) => s.toggleTranche);
  const patch = useDealStore((s) => s.patchTranche);

  const tone =
    tranche.seniority === "senior"
      ? "border-l-senior-500 bg-senior-50/40"
      : tranche.seniority === "junior"
      ? "border-l-junior-500 bg-junior-50/40"
      : "border-l-equity-500 bg-equity-50/40";

  return (
    <div
      className={classNames(
        "border border-senior-100 border-l-4 rounded p-3 space-y-2",
        tone,
        !tranche.enabled && "opacity-50"
      )}
    >
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={tranche.enabled}
            onChange={(e) => toggle(tranche.id, e.target.checked)}
            className="accent-senior-500"
          />
          <span className="text-sm font-semibold text-navy">{tranche.label}</span>
        </label>
        <span className="text-xs text-navySoft font-mono">
          {fmtMoney(tranche.amount)}
        </span>
      </div>

      {tranche.enabled && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Field label="Amount ($)">
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
            <Field label="Amort %">
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
          <label className="col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={tranche.prepayable}
              onChange={(e) =>
                patch(tranche.id, { prepayable: e.target.checked })
              }
              className="accent-senior-500"
            />
            <span className="fin-label">Subject to cash sweep</span>
          </label>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="fin-label">{label}</span>
      {children}
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

  const gap = outputs.gap;
  const gapColor = Math.abs(gap) < 1 ? "text-equity-700" : "text-junior-700";

  return (
    <aside className="w-full lg:w-[380px] lg:max-w-[380px] shrink-0 bg-white border-r border-senior-100 overflow-y-auto">
      <div className="p-4 border-b border-senior-100 bg-cream">
        <div className="text-xs uppercase tracking-wide text-navySoft">Sources / Uses</div>
        <div className="flex justify-between items-baseline mt-1">
          <span className="text-sm font-mono text-navy">
            {fmtMoney(outputs.sourcesTotal)} / {fmtMoney(outputs.usesTotal)}
          </span>
          <span className={classNames("text-sm font-mono font-semibold", gapColor)}>
            Gap {fmtMoney(gap)}
          </span>
        </div>
      </div>

      <Accordion title="Deal Setup">
        <Field label="Purchase Price ($)">
          <NumberInput
            value={inputs.purchasePrice}
            onChange={(n) => patchPurchase({ purchasePrice: n })}
            step={25}
            min={0}
          />
        </Field>
        <Field label="Fees ($)">
          <NumberInput
            value={inputs.fees}
            onChange={(n) => patchPurchase({ fees: n })}
            step={5}
            min={0}
          />
        </Field>
        <Field label="Opening Cash ($)">
          <NumberInput
            value={inputs.startingCash}
            onChange={(n) => patchPurchase({ startingCash: n })}
            step={5}
            min={0}
          />
        </Field>
      </Accordion>

      <Accordion title="Operating Drivers">
        <Slider
          label="Revenue Growth"
          value={inputs.operating.revenueGrowth}
          onChange={(n) => patchOperating({ revenueGrowth: n })}
          min={-0.10}
          max={0.25}
          step={0.005}
          format={fmtPct}
        />
        <Slider
          label="EBITDA Margin (Y1)"
          value={inputs.operating.ebitdaMargin}
          onChange={(n) => patchOperating({ ebitdaMargin: n })}
          min={0.05}
          max={0.50}
          step={0.005}
          format={fmtPct}
        />
        <Slider
          label="Margin Trajectory (annual Δ)"
          value={inputs.operating.marginTrajectory}
          onChange={(n) => patchOperating({ marginTrajectory: n })}
          min={-0.02}
          max={0.02}
          step={0.001}
          format={(n) => `${n >= 0 ? "+" : ""}${(n * 100).toFixed(1)}%`}
        />
        <Slider
          label="CapEx % of Revenue"
          value={inputs.operating.capexPct}
          onChange={(n) => patchOperating({ capexPct: n })}
          min={0}
          max={0.20}
          step={0.005}
          format={fmtPct}
        />
        <Slider
          label="NWC % of Revenue"
          value={inputs.operating.nwcPct}
          onChange={(n) => patchOperating({ nwcPct: n })}
          min={0}
          max={0.30}
          step={0.005}
          format={fmtPct}
        />
        <Slider
          label="Tax Rate"
          value={inputs.operating.taxRate}
          onChange={(n) => patchOperating({ taxRate: n })}
          min={0}
          max={0.40}
          step={0.005}
          format={fmtPct}
        />
        <Field label="Starting Revenue ($)">
          <NumberInput
            value={inputs.operating.revenueY1}
            onChange={(n) => patchOperating({ revenueY1: n })}
            step={50}
            min={0}
          />
        </Field>
      </Accordion>

      <Accordion title="Capital Stack" defaultOpen={true}>
        {inputs.stack.map((t) => (
          <TrancheCard key={t.id} tranche={t} />
        ))}
        <div className="pt-2 space-y-2">
          <Field label="Sponsor Equity ($)">
            <NumberInput
              value={inputs.equity.sponsor}
              onChange={(n) => patchEquity({ sponsor: n })}
              step={10}
              min={0}
            />
          </Field>
          <Field label="Management Equity ($)">
            <NumberInput
              value={inputs.equity.mgmt}
              onChange={(n) => patchEquity({ mgmt: n })}
              step={5}
              min={0}
            />
          </Field>
          <Field label="New Equity ($)">
            <NumberInput
              value={inputs.equity.newEquity}
              onChange={(n) => patchEquity({ newEquity: n })}
              step={5}
              min={0}
            />
          </Field>
          <Field label="Mgmt Performance Pool (%)">
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
      </Accordion>

      <Accordion title="Exit Assumptions">
        <Slider
          label="Exit Year"
          value={inputs.exit.exitYear}
          onChange={(n) => patchExit({ exitYear: Math.round(n) })}
          min={3}
          max={10}
          step={1}
          format={(n) => `Year ${Math.round(n)}`}
        />
        <Slider
          label="Exit EBITDA Multiple"
          value={inputs.exit.exitMultiple}
          onChange={(n) => patchExit({ exitMultiple: n })}
          min={4}
          max={15}
          step={0.25}
          format={fmtMult}
        />
        <Slider
          label="Cash Sweep %"
          value={inputs.exit.sweepPct}
          onChange={(n) => patchExit({ sweepPct: n })}
          min={0}
          max={1}
          step={0.05}
          format={fmtPct}
        />
        <Field label="Minimum Cash Balance ($)">
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
