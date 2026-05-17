import { irr as solveIrr } from "./irr";
import type {
  DealInputs,
  DealOutputs,
  EquityHolder,
  Tranche,
  TrancheId,
  YearRow,
} from "./types";

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

function zeroRecord<T extends string>(keys: readonly T[]): Record<T, number> {
  const out = {} as Record<T, number>;
  for (const k of keys) out[k] = 0;
  return out;
}

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
  const dividends = inputs.dividends ?? { commonDivY1: 0, commonDivGrowth: 0, otherDivPerYear: 0 };
  const activeStack = stack.filter((t) => t.enabled);
  const trancheById = new Map<TrancheId, Tranche>();
  activeStack.forEach((t) => trancheById.set(t.id, t));

  const balance: Record<TrancheId, number> = zeroRecord(ALL_IDS);
  const originalAmount: Record<TrancheId, number> = zeroRecord(ALL_IDS);
  activeStack.forEach((t) => {
    balance[t.id] = t.amount;
    originalAmount[t.id] = t.amount;
  });

  const years: YearRow[] = [];
  let cash = inputs.startingCash;
  let prevRevenue = op.revenueY1;
  let nol = inputs.nolBalance ?? 0;
  const revolverLimit = inputs.revolverLimit || Infinity;

  const exitYear = Math.max(1, Math.floor(exit.exitYear));

  // Track per-equity-holder cash flow stream (Y0..exitYear, plus a slot for exit Y).
  const undilutedTotal =
    inputs.equity.sponsor + inputs.equity.mgmt + inputs.equity.newEquity;
  const sponsorShareOfDiv =
    undilutedTotal > 0 ? inputs.equity.sponsor / undilutedTotal : 0;
  const mgmtShareOfDiv =
    undilutedTotal > 0 ? inputs.equity.mgmt / undilutedTotal : 0;
  const newEqShareOfDiv =
    undilutedTotal > 0 ? inputs.equity.newEquity / undilutedTotal : 0;

  const sponsorCFs = new Array(exitYear + 1).fill(0);
  const mgmtCFs = new Array(exitYear + 1).fill(0);
  const newEqCFs = new Array(exitYear + 1).fill(0);
  sponsorCFs[0] = -inputs.equity.sponsor;
  mgmtCFs[0] = -inputs.equity.mgmt;
  newEqCFs[0] = -inputs.equity.newEquity;

  for (let y = 1; y <= exitYear; y++) {
    // --- Operating ---
    const revenue =
      y === 1 ? op.revenueY1 : prevRevenue * (1 + op.revenueGrowth);
    const margin = Math.max(0, op.ebitdaMargin + (y - 1) * op.marginTrajectory);
    const ebitda = revenue * margin;
    const da = revenue * op.daPct;
    const ebit = ebitda - da;

    // --- Interest on beginning-of-year balances ---
    const trancheInterest: Record<TrancheId, number> = zeroRecord(ALL_IDS);
    let cashInterest = 0;
    let pikInterest = 0;
    for (const t of activeStack) {
      if (balance[t.id] <= 0) continue;
      const intExp = balance[t.id] * t.coupon;
      trancheInterest[t.id] = intExp;
      const isPikYear = y <= t.pikYears;
      const alwaysPik = t.id === "preferred";
      if (isPikYear || alwaysPik) {
        pikInterest += intExp;
        balance[t.id] += intExp;
      } else {
        cashInterest += intExp;
      }
    }

    // --- Taxes with NOL carryforward ---
    const ebt = ebit - cashInterest;
    let taxes = 0;
    if (ebt > 0) {
      const taxableIncome = Math.max(0, ebt - nol);
      const nolUsed = Math.min(nol, ebt);
      nol -= nolUsed;
      taxes = taxableIncome * op.taxRate;
    } else {
      // Loss adds to NOL.
      nol += -ebt;
    }
    const netIncome = ebt - taxes;

    // --- Cash flow ---
    const capex = revenue * op.capexPct;
    const revenueDelta = y === 1 ? 0 : revenue - prevRevenue;
    const nwcChange = op.nwcPct * revenueDelta;

    const cfo = netIncome + da + pikInterest - nwcChange;
    const cfi = -capex;
    const preFinancing = cfo + cfi;

    // --- Dividend recap to equity (paid out of cash before debt sweep) ---
    const commonDiv =
      dividends.commonDivY1 * Math.pow(1 + dividends.commonDivGrowth, y - 1);
    const otherDiv = dividends.otherDivPerYear;
    const totalDividends = commonDiv + otherDiv;

    // Distribute pro-rata to undiluted equity holders.
    sponsorCFs[y] += totalDividends * sponsorShareOfDiv;
    mgmtCFs[y] += totalDividends * mgmtShareOfDiv;
    newEqCFs[y] += totalDividends * newEqShareOfDiv;

    // --- Block 2: Mandatory amortization ---
    const trancheMandatory: Record<TrancheId, number> = zeroRecord(ALL_IDS);
    let totalMandatory = 0;
    for (const t of activeStack) {
      if (balance[t.id] <= 0) continue;
      let mand = 0;
      if (t.amortPct > 0 && t.id !== "revolver" && t.id !== "preferred") {
        mand = Math.min(originalAmount[t.id] * t.amortPct, balance[t.id]);
      }
      if (y === t.maturity) {
        mand = balance[t.id];
      }
      if (t.id === "preferred" && y === t.maturity) {
        mand = balance[t.id];
      }
      trancheMandatory[t.id] = mand;
      totalMandatory += mand;
    }
    for (const id of ALL_IDS) balance[id] -= trancheMandatory[id];

    // --- Block 3: Cash check / revolver gate ---
    let cashAfterMandatory = cash + preFinancing - totalDividends - totalMandatory;
    let revolverDraw = 0;
    let sweepPool = 0;

    if (cashAfterMandatory < exit.minCash) {
      const needed = exit.minCash - cashAfterMandatory;
      // Respect revolver commitment limit.
      const headroom = Math.max(0, revolverLimit - balance.revolver);
      revolverDraw = Math.min(needed, headroom);
      balance.revolver += revolverDraw;
      cashAfterMandatory += revolverDraw;
    }

    let endingCash = cashAfterMandatory;
    const trancheOptional: Record<TrancheId, number> = zeroRecord(ALL_IDS);

    if (endingCash > exit.minCash) {
      const excess = endingCash - exit.minCash;
      sweepPool = excess * exit.sweepPct;
      endingCash -= sweepPool;
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
      endingCash += remaining;
    }

    // --- Snapshot ---
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
      dividendsPaid: totalDividends,
      mandatoryAmort: totalMandatory,
      revolverDraw,
      sweepPool,
      appliedToCascade: sweepPool,
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

  const debtAtExit = (Object.keys(exitRow.trancheBalances) as TrancheId[])
    .filter((id) => id !== "preferred")
    .reduce((s, id) => s + exitRow.trancheBalances[id], 0);
  const prefAtExit = exitRow.trancheBalances.preferred;
  const cashAtExit = exitRow.endingCash;
  const equityValue = enterpriseValue - debtAtExit - prefAtExit + cashAtExit;

  // ----- Equity allocation -----
  const holders = allocateEquity(
    inputs,
    equityValue,
    sponsorCFs,
    mgmtCFs,
    newEqCFs,
    exitYear
  );

  const sponsor = holders.find((h) => h.id === "sponsor");
  const sponsorIRR = sponsor?.irr ?? NaN;
  const sponsorMOIC = sponsor?.moic ?? NaN;

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

  return {
    years,
    sourcesTotal: totalSources(inputs),
    usesTotal: totalUses(inputs),
    gap: totalSources(inputs) - totalUses(inputs),
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

function allocateEquity(
  inputs: DealInputs,
  equityValue: number,
  sponsorCFs: number[],
  mgmtCFs: number[],
  newEqCFs: number[],
  exitYear: number
): EquityHolder[] {
  const { equity, stack } = inputs;
  const activeStack = stack.filter((t) => t.enabled);

  const subKicker = activeStack.find((t) => t.id === "sub_notes")?.kicker ?? 0;
  const mezzKicker = activeStack.find((t) => t.id === "mezz")?.kicker ?? 0;
  const prefKicker = activeStack.find((t) => t.id === "preferred")?.kicker ?? 0;
  const newEqKicker = equity.newEquityKicker ?? 0;
  const mgmtPool = equity.mgmtPool;

  const totalKickers = subKicker + mezzKicker + prefKicker + mgmtPool + newEqKicker;
  const undilutedShare = Math.max(0, 1 - totalKickers);

  const undilutedDollars = equity.sponsor + equity.mgmt + equity.newEquity;
  const sponsorPct =
    undilutedDollars > 0 ? (equity.sponsor / undilutedDollars) * undilutedShare : 0;
  const mgmtPct =
    undilutedDollars > 0 ? (equity.mgmt / undilutedDollars) * undilutedShare : 0;
  const newEqPct =
    undilutedDollars > 0
      ? (equity.newEquity / undilutedDollars) * undilutedShare + newEqKicker
      : newEqKicker;

  const makeUndiluted = (
    id: string,
    label: string,
    invested: number,
    sharePct: number,
    cfs: number[]
  ): EquityHolder => {
    const exitValue = Math.max(0, equityValue) * sharePct;
    const series = [...cfs];
    series[exitYear] += exitValue;
    const irr = invested > 0 ? solveIrr(series) : NaN;
    const totalIn = series.reduce((s, c) => s + (c > 0 ? c : 0), 0);
    const moic = invested > 0 ? totalIn / invested : NaN;
    return { id, label, invested, sharePct, exitValue, irr, moic };
  };

  const makeKicker = (
    id: string,
    label: string,
    sharePct: number
  ): EquityHolder => {
    const exitValue = Math.max(0, equityValue) * sharePct;
    return {
      id,
      label,
      invested: 0,
      sharePct,
      exitValue,
      irr: NaN,
      moic: NaN,
    };
  };

  return [
    makeUndiluted("sponsor", "Sponsor", equity.sponsor, sponsorPct, sponsorCFs),
    makeUndiluted("mgmt", "Management", equity.mgmt, mgmtPct, mgmtCFs),
    makeUndiluted("new_eq", "New Equity", equity.newEquity, newEqPct, newEqCFs),
    makeKicker("mgmt_pool", "Mgmt Performance Pool", mgmtPool),
    makeKicker("sub_kicker", "Sub Notes Kicker", subKicker),
    makeKicker("mezz_kicker", "Mezz Kicker", mezzKicker),
    makeKicker("pref_kicker", "Preferred Kicker", prefKicker),
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

// ----- 2D sensitivity grid -----
// Multiple × exit year, with IRR in each cell. Used by the Sensitivity panel.

export interface SensitivityGrid {
  multipleAxis: number[];
  yearAxis: number[];
  irrs: number[][];   // irrs[multipleIdx][yearIdx]
}

export function buildSensitivityGrid(
  inputs: DealInputs,
  multipleSteps: number[] = [-2, -1, 0, 1, 2],
  yearSteps: number[] = [-2, -1, 0, 1, 2]
): SensitivityGrid {
  const baseMult = inputs.exit.exitMultiple;
  const baseYr = inputs.exit.exitYear;
  const multipleAxis = multipleSteps.map((s) => Math.max(1, baseMult + s));
  const yearAxis = yearSteps.map((s) => Math.max(1, Math.round(baseYr + s)));
  const irrs: number[][] = multipleAxis.map(() => yearAxis.map(() => NaN));

  for (let mi = 0; mi < multipleAxis.length; mi++) {
    for (let yi = 0; yi < yearAxis.length; yi++) {
      const next: DealInputs = {
        ...inputs,
        exit: {
          ...inputs.exit,
          exitMultiple: multipleAxis[mi],
          exitYear: yearAxis[yi],
        },
      };
      const out = computeDeal(next, { skipSensitivity: true });
      irrs[mi][yi] = out.sponsorIRR;
    }
  }
  return { multipleAxis, yearAxis, irrs };
}
