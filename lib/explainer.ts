import { computeDeal } from "./lbo-engine.ts";
import type { ChangeEvent } from "./store.ts";
import type { DealInputs, DealOutputs } from "./types.ts";
import { fmtMoney, fmtPct, fmtMult } from "./format.ts";

const TRANCHE_LABEL: Record<string, string> = {
  existing: "existing debt",
  revolver: "revolver",
  tla: "TLA",
  tlb: "TLB",
  sr_notes: "Senior Notes",
  sub_notes: "Sub Notes",
  mezz: "mezz",
  seller: "seller note",
  preferred: "preferred",
};

const OPERATING_LABEL: Record<string, string> = {
  revenueY1: "starting revenue",
  revenueGrowth: "revenue growth",
  ebitdaMargin: "Y1 EBITDA margin",
  marginTrajectory: "EBITDA margin trajectory",
  capexPct: "capex %",
  nwcPct: "NWC %",
  taxRate: "tax rate",
  daPct: "D&A %",
};

const EXIT_LABEL: Record<string, string> = {
  exitYear: "exit year",
  exitMultiple: "exit multiple",
  sweepPct: "cash sweep %",
  minCash: "minimum cash",
};

const EQUITY_LABEL: Record<string, string> = {
  sponsor: "sponsor equity",
  mgmt: "management equity",
  newEquity: "new equity",
  mgmtPool: "management performance pool",
};

export interface Explanation {
  headline: string;
  detail: string;
}

export function explain(
  change: ChangeEvent | null,
  before: DealInputs | null,
  after: DealInputs,
  afterOut: DealOutputs
): Explanation {
  if (!change) {
    return {
      headline: "Welcome to the visualizer.",
      detail:
        "Edit any input on the left and we'll explain what changed in the deal and why your returns moved.",
    };
  }

  if (change.kind === "preset") {
    return {
      headline: `Loaded the "${change.id}" preset.`,
      detail: `Sponsor IRR comes in at ${fmtPct(afterOut.sponsorIRR)} on a ${fmtMult(afterOut.sponsorMOIC)} MOIC. Equity value at exit: ${fmtMoney(afterOut.exit.equityValue)}.`,
    };
  }

  // Compute the "before" output to get a delta.
  const beforeOut = before ? computeDeal(before, { skipSensitivity: true }) : null;
  const irrDelta = beforeOut
    ? afterOut.sponsorIRR - beforeOut.sponsorIRR
    : 0;
  const dirWord = irrDelta > 0 ? "rose" : irrDelta < 0 ? "dropped" : "held";
  const deltaStr = `${Math.abs(irrDelta * 100).toFixed(1)} percentage points`;

  const beforeIrrStr = beforeOut ? fmtPct(beforeOut.sponsorIRR) : "—";
  const afterIrrStr = fmtPct(afterOut.sponsorIRR);
  const movePhrase =
    Math.abs(irrDelta) < 0.001
      ? `Sponsor IRR held at ${afterIrrStr}.`
      : `Sponsor IRR ${dirWord} ${deltaStr}, from ${beforeIrrStr} to ${afterIrrStr}.`;

  if (change.kind === "operating") {
    const lbl = OPERATING_LABEL[change.field as string] ?? String(change.field);
    return {
      headline: `You changed ${lbl}.`,
      detail: `${movePhrase} Operating drivers flow straight through to EBITDA, cash generation, and how quickly debt gets paid down.`,
    };
  }

  if (change.kind === "exit") {
    const lbl = EXIT_LABEL[change.field as string] ?? String(change.field);
    if (change.field === "exitMultiple") {
      return {
        headline: `You moved the exit multiple to ${fmtMult(change.to as number)}.`,
        detail: `${movePhrase} Multiple expansion (or contraction) is usually the single biggest IRR lever in an LBO.`,
      };
    }
    if (change.field === "sweepPct") {
      const swp = (change.to as number) * 100;
      return {
        headline: `Cash sweep is now ${swp.toFixed(0)}%.`,
        detail:
          swp < 100
            ? `${movePhrase} Less cash now goes to paying down debt — it accumulates on the balance sheet (${fmtMoney(afterOut.exit.cashAtExit)} by exit). Sponsor IRR barely moves when debt is cheap, because the cash still ends up in equity value at exit.`
            : `${movePhrase} Maximum sweep means every dollar of excess cash repays the cheapest debt available.`,
      };
    }
    return {
      headline: `You changed ${lbl}.`,
      detail: movePhrase,
    };
  }

  if (change.kind === "equity") {
    const lbl = EQUITY_LABEL[change.field as string] ?? String(change.field);
    return {
      headline: `You adjusted ${lbl}.`,
      detail: `${movePhrase} Equity mix changes who collects the proceeds at exit; the dilution from kickers shows up directly in sponsor share.`,
    };
  }

  if (change.kind === "purchase") {
    return {
      headline: `You changed ${change.field}.`,
      detail: `${movePhrase} Purchase price flexes the entry multiple — a lower entry typically lifts IRR materially.`,
    };
  }

  if (change.kind === "tranche") {
    const lbl = TRANCHE_LABEL[change.id] ?? change.id;
    if (change.field === "enabled") {
      return {
        headline: change.to
          ? `You enabled the ${lbl}.`
          : `You removed the ${lbl}.`,
        detail: `${movePhrase} Adjusting the capital stack changes the cost of debt, the dilution at exit, and how quickly the deal delevers.`,
      };
    }
    if (change.field === "kicker") {
      return {
        headline: `You changed the ${lbl} equity kicker.`,
        detail: `${movePhrase} Kickers are the "cheap debt" tradeoff — they hold the coupon down but dilute sponsor equity at exit.`,
      };
    }
    if (change.field === "coupon") {
      return {
        headline: `You changed the ${lbl} coupon.`,
        detail: `${movePhrase} Higher coupons mean less cash available for debt repayment and more taxable interest shield.`,
      };
    }
    if (change.field === "amount") {
      return {
        headline: `You resized the ${lbl}.`,
        detail: `${movePhrase} Resizing tranches without changing equity changes leverage — and IRR scales with leverage when the business is healthy.`,
      };
    }
    return {
      headline: `You changed the ${lbl} ${String(change.field)}.`,
      detail: movePhrase,
    };
  }

  return { headline: "Recomputed.", detail: movePhrase };
}
