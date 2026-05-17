import { irr as solveIrr } from "./irr.ts";
import type {
  DealInputs,
  DealOutputs,
  EquityHolder,
  Tranche,
  TrancheId,
  YearRow,
} from "./types.ts";

// Order of tranches in the optional cash-sweep cascade (most senior first).
// Revolver is repaid first when sweeping.
const CASCADE_ORDER: TrancheId[] = [
  "revolver",
  "existing",
  "tla",
  "tlb",
  "sr_notes",
  "sub_notes",
  "mezz",
  "seller",
];

function zeroRecord<T extends string>(keys: readonly T[]): Record<T, number> {
  const out = {} as Record<T, number>;
  for (const k of keys) out[k] = 0;
  return out;
}

const ALL_IDS: TrancheId[] = [
  "existing",
  "revolver",
  "tla",
  "tlb",
  "sr_notes",
  "sub_notes",
  "mezz",
  "seller",
  "preferred",
];

// ----- Sources & uses -----

export function totalSources(inputs: DealInputs): number {
  const debt = inputs.stack
    .filter((t) => t.enabled)
    .reduce((s, t) => s + t.amount, 0);
  const eq = inputs.equity.sponsor + inputs.equity.mgmt + inputs.equity.newEquity;
  return debt + eq;
}

export function totalUses(inputs: DealInputs): number {
  return inputs.purchasePrice + inputs.fees;
}

// ----- Main engine -----

export function computeDeal(
  inputs: DealInputs,
  opts: { skipSensitivity?: boolean } = {}
): DealOutputs {
  const { operating: op, exit, stack } = inputs;
  const activeStack = stack.filter((t) => t.enabled);
  const trancheById = new Map<TrancheId, Tranche>();
  activeStack.forEach((t) => trancheById.set(t.id, t));

  // Mutable balances + originals.
  const balance: Record<TrancheId, number> = zeroRecord(ALL_IDS);
  const originalAmount: Record<TrancheId, number> = zeroRecord(ALL_IDS);
  activeStack.forEach((t) => {
    balance[t.id] = t.amount;
    originalAmount[t.id] = t.amount;
  });

  const years: YearRow[] = [];
  let cash = inputs.startingCash;
  let prevRevenue = op.revenueY1; // for NWC delta on Y1 use Y1 minus Y1 = 0

  const exitYear = Math.max(1, Math.floor(exit.exitYear));

  for (let y = 1; y <= exitYear; y++) {
    // --- Operating ---
    const revenue =
      y === 1 ? op.revenueY1 : prevRevenue * (1 + op.revenueGrowth);
    const margin = Math.max(0, op.ebitdaMargin + (y - 1) * op.marginTrajectory);
    const ebitda = revenue * margin;
    const da = revenue * op.daPct;
    const ebit = ebitda - da;

    // --- Interest on beginning-of-year balances (no circularity) ---
    const trancheInterest: Record<TrancheId, number> = zeroRecord(ALL_IDS);
    let cashInterest = 0;
    let pikInterest = 0; // accrues to balance, not P&L cash
    for (const t of activeStack) {
      if (balance[t.id] <= 0) continue;
      const intExp = balance[t.id] * t.coupon;
      trancheInterest[t.id] = intExp;
      const isPikYear = y <= t.pikYears;
      // Preferred: always PIK-style (accrues, paid at retirement)
      const alwaysPik = t.id === "preferred";
      if (isPikYear || alwaysPik) {
        pikInterest += intExp;
        balance[t.id] += intExp; // accrue
      } else {
        cashInterest += intExp;
      }
    }

    // Preferred dividends are NOT tax-deductible; cash interest IS.
    const ebt = ebit - cashInterest;
    const taxes = Math.max(0, ebt) * op.taxRate;
    const netIncome = ebt - taxes;

    // --- Cash flow ---
    const capex = revenue * op.capexPct;
    // NWC change = pct * delta revenue (negative cash if revenue grows)
    const revenueDelta = y === 1 ? 0 : revenue - prevRevenue;
    const nwcChange = op.nwcPct * revenueDelta;

    // CFO uses net income + D&A + PIK addback (non-cash interest)
    const cfo = netIncome + da + pikInterest - nwcChange;
    const cfi = -capex;
    const preFinancing = cfo + cfi;

    // --- Block 2: Mandatory amortization ---
    const trancheMandatory: Record<TrancheId, number> = zeroRecord(ALL_IDS);
    let totalMandatory = 0;
    for (const t of activeStack) {
      if (balance[t.id] <= 0) continue;
      let mand = 0;
      // Straight-line amort as % of original.
      if (t.amortPct > 0 && t.id !== "revolver" && t.id !== "preferred") {
        mand = Math.min(originalAmount[t.id] * t.amortPct, balance[t.id]);
      }
      // Bullet at maturity.
      if (y === t.maturity) {
        mand = balance[t.id]; // pay off whatever remains
      }
      // Preferred retires at its maturity year (full balance with accrued).
      if (t.id === "preferred" && y === t.maturity) {
        mand = balance[t.id];
      }
      trancheMandatory[t.id] = mand;
      totalMandatory += mand;
    }

    // Apply mandatory.
    for (const id of ALL_IDS) {
      balance[id] -= trancheMandatory[id];
    }

    // --- Block 3: Cash check / revolver draw / excess gate ---
    let cashAfterMandatory = cash + preFinancing - totalMandatory;
    let revolverDraw = 0;
    let sweepPool = 0;

    const revolverTranche = trancheById.get("revolver");
    if (cashAfterMandatory < exit.minCash) {
      // Draw revolver to top up to min cash.
      const needed = exit.minCash - cashAfterMandatory;
      if (revolverTranche) {
        revolverDraw = needed;
        balance.revolver += needed;
        cashAfterMandatory += needed;
      } else {
        // No revolver: cash can go below min (debt becomes effectively underfunded).
      }
    }

    let endingCash = cashAfterMandatory;
    const trancheOptional: Record<TrancheId, number> = zeroRecord(ALL_IDS);

    if (endingCash > exit.minCash) {
      const excess = endingCash - exit.minCash;
      sweepPool = excess * exit.sweepPct;
      endingCash -= sweepPool;

      // --- Block 4: Optional cascade ---
      let remaining = sweepPool;
      for (const id of CASCADE_ORDER) {
        if (remaining <= 0) break;
        const t = trancheById.get(id);
        if (!t || !t.prepayable) continue;
        if (balance[id] <= 0) continue;
        const pay = Math.min(remaining, balance[id]);
        balance[id] -= pay;
        trancheOptional[id] = pay;
        remaining -= pay;
      }
      // Anything left in the sweep that didn't find a home returns to cash.
      endingCash += remaining;
    }

    // --- Roll up balances for the snapshot ---
    const trancheBalances: Record<TrancheId, number> = zeroRecord(ALL_IDS);
    for (const id of ALL_IDS) trancheBalances[id] = balance[id];

    const tranchePrincipal: Record<TrancheId, number> = zeroRecord(ALL_IDS);
    for (const id of ALL_IDS) {
      tranchePrincipal[id] =
        trancheMandatory[id] + trancheOptional[id] - (id === "revolver" ? revolverDraw : 0);
    }

    const totalDebt = (Object.keys(balance) as TrancheId[])
      .filter((id) => id !== "preferred")
      .reduce((s, id) => s + balance[id], 0);

    const leverageRatio = ebitda > 0 ? totalDebt / ebitda : 0;

    years.push({
      year: y,
      revenue,
      ebitda,
      da,
      ebit,
      interest: cashInterest + pikInterest,
      taxes,
      netIncome,
      capex,
      nwcChange,
      cfo,
      cfi,
      preFinancing,
      mandatoryAmort: totalMandatory,
      revolverDraw,
      sweepPool,
      appliedToCascade: sweepPool - (endingCash - cashAfterMandatory + sweepPool < 0 ? 0 : 0),
      endingCash,
      totalDebt,
      leverageRatio,
      trancheBalances,
      trancheInterest,
      tranchePrincipal,
      trancheMandatory,
      trancheOptional,
    });

    cash = endingCash;
    prevRevenue = revenue;
  }

  // ----- Exit -----
  const exitRow = years[years.length - 1];
  const exitEbitda = exitRow.ebitda;
  const enterpriseValue = exitEbitda * exit.exitMultiple;

  // Net debt at exit = sum of debt balances - cash. Preferred is repaid out of EV
  // (treated like debt for proceeds-to-equity purposes since holders are senior to common).
  const debtAtExit = (Object.keys(exitRow.trancheBalances) as TrancheId[])
    .filter((id) => id !== "preferred")
    .reduce((s, id) => s + exitRow.trancheBalances[id], 0);
  const prefAtExit = exitRow.trancheBalances.preferred;
  const cashAtExit = exitRow.endingCash;
  const equityValue = enterpriseValue - debtAtExit - prefAtExit + cashAtExit;

  // ----- Equity allocation -----
  const holders = allocateEquity(inputs, equityValue);

  const sponsor = holders.find((h) => h.id === "sponsor");
  const sponsorIRR = sponsor?.irr ?? NaN;
  const sponsorMOIC = sponsor?.moic ?? NaN;

  // Sensitivity (vary multiple by ±2x). Skip when called recursively.
  const sensitivity = opts.skipSensitivity
    ? {
        bear: { multiple: exit.exitMultiple - 2, irr: NaN },
        base: { multiple: exit.exitMultiple, irr: sponsorIRR },
        bull: { multiple: exit.exitMultiple + 2, irr: NaN },
      }
    : {
        bear: sensitivityCase(inputs, exit.exitMultiple - 2),
        base: { multiple: exit.exitMultiple, irr: sponsorIRR },
        bull: sensitivityCase(inputs, exit.exitMultiple + 2),
      };

  const sourcesT = totalSources(inputs);
  const usesT = totalUses(inputs);

  return {
    years,
    sourcesTotal: sourcesT,
    usesTotal: usesT,
    gap: sourcesT - usesT,
    exit: {
      year: exitYear,
      exitEbitda,
      enterpriseValue,
      netDebt: debtAtExit + prefAtExit - cashAtExit,
      cashAtExit,
      equityValue,
    },
    holders,
    sponsorIRR,
    sponsorMOIC,
    sensitivity,
  };
}

// ----- Equity allocation helper -----
//
// Convention: Sponsor + Mgmt + NewEquity are the "undiluted" pool, splitting
// pro-rata by dollars invested. Kickers (Sub kicker, Mezz kicker, Pref kicker,
// Mgmt pool) are each granted X% of the FULLY-DILUTED equity, diluting the
// undiluted holders pro-rata.

function allocateEquity(inputs: DealInputs, equityValue: number): EquityHolder[] {
  const { equity, stack, exit } = inputs;
  const activeStack = stack.filter((t) => t.enabled);

  const subKicker = activeStack.find((t) => t.id === "sub_notes")?.kicker ?? 0;
  const mezzKicker = activeStack.find((t) => t.id === "mezz")?.kicker ?? 0;
  const prefKicker = activeStack.find((t) => t.id === "preferred")?.kicker ?? 0;
  const mgmtPool = equity.mgmtPool;

  const totalKickers = subKicker + mezzKicker + prefKicker + mgmtPool;
  const undilutedShare = Math.max(0, 1 - totalKickers);

  const undilutedDollars = equity.sponsor + equity.mgmt + equity.newEquity;
  const sponsorPct = undilutedDollars > 0 ? (equity.sponsor / undilutedDollars) * undilutedShare : 0;
  const mgmtPct = undilutedDollars > 0 ? (equity.mgmt / undilutedDollars) * undilutedShare : 0;
  const newEqPct = undilutedDollars > 0 ? (equity.newEquity / undilutedDollars) * undilutedShare : 0;

  const exitYear = Math.max(1, Math.floor(exit.exitYear));

  const make = (
    id: string,
    label: string,
    invested: number,
    sharePct: number
  ): EquityHolder => {
    const exitValue = Math.max(0, equityValue) * sharePct;
    const cashflows = new Array(exitYear + 1).fill(0);
    cashflows[0] = -invested;
    cashflows[exitYear] = exitValue;
    const irr = invested > 0 ? solveIrr(cashflows) : NaN;
    const moic = invested > 0 ? exitValue / invested : NaN;
    return { id, label, invested, sharePct, exitValue, irr, moic };
  };

  return [
    make("sponsor", "Sponsor", equity.sponsor, sponsorPct),
    make("mgmt", "Management", equity.mgmt, mgmtPct),
    make("new_eq", "New Equity", equity.newEquity, newEqPct),
    make("mgmt_pool", "Mgmt Performance Pool", 0, mgmtPool),
    make("sub_kicker", "Sub Notes Kicker", 0, subKicker),
    make("mezz_kicker", "Mezz Kicker", 0, mezzKicker),
    make("pref_kicker", "Preferred Kicker", 0, prefKicker),
  ];
}

function sensitivityCase(inputs: DealInputs, multiple: number) {
  if (multiple <= 0) return { multiple, irr: NaN };
  const out = computeDeal(
    { ...inputs, exit: { ...inputs.exit, exitMultiple: multiple } },
    { skipSensitivity: true }
  );
  return { multiple, irr: out.sponsorIRR };
}
