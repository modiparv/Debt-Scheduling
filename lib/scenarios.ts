import type { DealInputs, Tranche } from "./types";

// Empty template — disabled tranches that presets switch on.
export function emptyStack(): Tranche[] {
  return [
    {
      id: "existing",
      label: "Existing Debt (Assumed)",
      enabled: false,
      amount: 0,
      coupon: 0.0425,
      maturity: 3,
      amortPct: 0.1111,
      pikYears: 0,
      prepayable: true,
      kicker: 0,
      seniority: "senior",
      color: "#0E142B",
    },
    {
      id: "revolver",
      label: "Bank Revolver",
      enabled: false,
      amount: 0,
      coupon: 0.0475,
      maturity: 8,
      amortPct: 0,
      pikYears: 0,
      prepayable: true,
      kicker: 0,
      seniority: "senior",
      color: "#1F2A4A",
    },
    {
      id: "tla",
      label: "Term Loan A",
      enabled: false,
      amount: 0,
      coupon: 0.055,
      maturity: 8,
      amortPct: 0.125,
      pikYears: 0,
      prepayable: true,
      kicker: 0,
      seniority: "senior",
      color: "#3F4F7A",
    },
    {
      id: "tlb",
      label: "Term Loan B",
      enabled: false,
      amount: 0,
      coupon: 0.0525,
      maturity: 11,
      amortPct: 0.04,
      pikYears: 0,
      prepayable: true,
      kicker: 0,
      seniority: "senior",
      color: "#8A95B0",
    },
    {
      id: "sr_notes",
      label: "Senior Notes",
      enabled: false,
      amount: 0,
      coupon: 0.0425,
      maturity: 9,
      amortPct: 0,
      pikYears: 0,
      prepayable: true,
      kicker: 0,
      seniority: "senior",
      color: "#5E5E5E",
    },
    {
      id: "sub_notes",
      label: "Subordinated Notes",
      enabled: false,
      amount: 0,
      coupon: 0.045,
      maturity: 12,
      amortPct: 0,
      pikYears: 5,
      prepayable: true,
      kicker: 0.03,
      seniority: "junior",
      color: "#B89A3C",
    },
    {
      id: "mezz",
      label: "Mezzanine",
      enabled: false,
      amount: 0,
      coupon: 0.045,
      maturity: 14,
      amortPct: 0,
      pikYears: 5,
      prepayable: true,
      kicker: 0.05,
      seniority: "junior",
      color: "#D4AF37",
    },
    {
      id: "seller",
      label: "Seller Notes",
      enabled: false,
      amount: 0,
      coupon: 0.0525,
      maturity: 7,
      amortPct: 0.1429,
      pikYears: 5,
      prepayable: true,
      kicker: 0,
      seniority: "junior",
      color: "#8C6F1F",
    },
    {
      id: "preferred",
      label: "Preferred Stock",
      enabled: false,
      amount: 0,
      coupon: 0.07,
      maturity: 9,
      amortPct: 0,
      pikYears: 5,
      prepayable: false,
      kicker: 0.04,
      seniority: "preferred",
      color: "#5E3A6B",
    },
  ];
}

function setTranche(
  stack: Tranche[],
  id: Tranche["id"],
  patch: Partial<Tranche>
): Tranche[] {
  return stack.map((t) => (t.id === id ? { ...t, ...patch, enabled: true } : t));
}

// ---------- Reference / Base Case ----------
// Reproduces the user's Excel model (LBO_Model_v2.xlsx).
//   Equity PP $660k, Existing debt assumed $65k, transaction costs ~$13k,
//   Total funds $950.9k. Sales Y1 $1.1M, 10% growth, ~30% EBITDA margin.
//   Tax 35%, capex 10%, cash min $50k, sweep 100%.
//   Exit Y9 @ 6.0x. Target: Sponsor IRR 27.37%, equity value $2.965M.

export function baseCase(): DealInputs {
  let stack = emptyStack();
  stack = setTranche(stack, "existing", { amount: 65, coupon: 0.0425, maturity: 3, amortPct: 0.1111 });
  stack = setTranche(stack, "revolver", { amount: 200.9, coupon: 0.0475 });
  stack = setTranche(stack, "tla", { amount: 80, coupon: 0.055, amortPct: 0.125, maturity: 8 });
  stack = setTranche(stack, "tlb", { amount: 55, coupon: 0.0525, amortPct: 0.04, maturity: 11 });
  stack = setTranche(stack, "sr_notes", { amount: 65, coupon: 0.0425, maturity: 9 });
  stack = setTranche(stack, "sub_notes", { amount: 40, coupon: 0.045, pikYears: 5, kicker: 0.03, maturity: 12 });
  stack = setTranche(stack, "mezz", { amount: 70, coupon: 0.045, pikYears: 5, kicker: 0.05, maturity: 14 });
  stack = setTranche(stack, "seller", { amount: 25, coupon: 0.0525, pikYears: 5, amortPct: 0.1429, maturity: 7 });
  stack = setTranche(stack, "preferred", { amount: 60, coupon: 0.07, pikYears: 5, kicker: 0.04, maturity: 9 });

  return {
    purchasePrice: 950,
    fees: 0,
    startingCash: 55,            // existing BS cash from Excel
    revolverLimit: 600,
    nolBalance: 15.5,
    operating: {
      revenueY1: 1100,
      revenueGrowth: 0.10,
      // Excel: COGS 45% (+0.25%/yr), SGA 14% (+0.5%/yr), Other 12% (+0.15%/yr)
      // → Y1 margin 29%, dropping ~0.9pp/yr to ~21.8% by Y9
      ebitdaMargin: 0.29,
      marginTrajectory: -0.009,
      capexPct: 0.10,
      nwcPct: 0.05,
      taxRate: 0.35,
      daPct: 0.05,
    },
    stack,
    equity: {
      sponsor: 220,
      mgmt: 40,
      newEquity: 25,
      mgmtPool: 0.04,
      newEquityKicker: 0.02,
    },
    exit: {
      exitYear: 9,
      exitMultiple: 6.0,
      sweepPct: 1.0,
      minCash: 50,
    },
    dividends: {
      commonDivY1: 2.5,
      commonDivGrowth: 0.05,
      otherDivPerYear: 0,
    },
  };
}

// ---------- Preset scenarios ----------

export function conservativeLBO(): DealInputs {
  let stack = emptyStack();
  stack = setTranche(stack, "tla", { amount: 200, amortPct: 0.15, coupon: 0.055 });
  stack = setTranche(stack, "tlb", { amount: 100, coupon: 0.0525 });
  stack = setTranche(stack, "revolver", { amount: 25 });

  return {
    purchasePrice: 950,
    fees: 0,
    startingCash: 25,
    revolverLimit: 200,
    nolBalance: 0,
    operating: {
      revenueY1: 1100,
      revenueGrowth: 0.03,
      ebitdaMargin: 0.30,
      marginTrajectory: 0.002,
      capexPct: 0.10,
      nwcPct: 0.05,
      taxRate: 0.35,
      daPct: 0.05,
    },
    stack,
    equity: { sponsor: 500, mgmt: 80, newEquity: 45, mgmtPool: 0.02 },
    exit: { exitYear: 5, exitMultiple: 7.5, sweepPct: 1.0, minCash: 50 },
    dividends: { commonDivY1: 2.5, commonDivGrowth: 0.05, otherDivPerYear: 0 },
  };
}

export function aggressive2007(): DealInputs {
  let stack = emptyStack();
  stack = setTranche(stack, "revolver", { amount: 50 });
  stack = setTranche(stack, "tla", { amount: 250 });
  stack = setTranche(stack, "tlb", { amount: 350 });
  stack = setTranche(stack, "sr_notes", { amount: 200 });
  stack = setTranche(stack, "mezz", { amount: 200, pikYears: 5, kicker: 0.05 });
  stack = setTranche(stack, "preferred", { amount: 100, kicker: 0.03 });

  return {
    purchasePrice: 1500,
    fees: 30,
    startingCash: 30,
    revolverLimit: 200,
    nolBalance: 0,
    operating: {
      revenueY1: 1200,
      revenueGrowth: 0.07,
      ebitdaMargin: 0.27,
      marginTrajectory: 0.002,
      capexPct: 0.08,
      nwcPct: 0.07,
      taxRate: 0.35,
      daPct: 0.05,
    },
    stack,
    equity: { sponsor: 320, mgmt: 50, newEquity: 10, mgmtPool: 0.03 },
    exit: { exitYear: 7, exitMultiple: 8.0, sweepPct: 1.0, minCash: 50 },
    dividends: { commonDivY1: 0, commonDivGrowth: 0, otherDivPerYear: 0 },
  };
}

export function covidStress(): DealInputs {
  const base = baseCase();
  return {
    ...base,
    operating: {
      ...base.operating,
      revenueGrowth: -0.05,
      marginTrajectory: -0.005,
      ebitdaMargin: 0.22,
    },
  };
}

export function sweepOff(): DealInputs {
  const base = baseCase();
  return { ...base, exit: { ...base.exit, sweepPct: 0 } };
}

export function noJuniorDebt(): DealInputs {
  const base = baseCase();
  const mezz = base.stack.find((t) => t.id === "mezz")?.amount ?? 0;
  const sub = base.stack.find((t) => t.id === "sub_notes")?.amount ?? 0;
  const pref = base.stack.find((t) => t.id === "preferred")?.amount ?? 0;
  const replaced = mezz + sub + pref;

  const stack = base.stack.map((t) =>
    t.id === "mezz" || t.id === "sub_notes" || t.id === "preferred"
      ? { ...t, enabled: false, amount: 0 }
      : t
  );

  return {
    ...base,
    stack,
    equity: { ...base.equity, sponsor: base.equity.sponsor + replaced },
  };
}

export const SCENARIO_PRESETS = [
  { id: "base", label: "Base Case", build: baseCase },
  { id: "conservative", label: "Conservative LBO", build: conservativeLBO },
  { id: "aggressive", label: "Aggressive 2007", build: aggressive2007 },
  { id: "covid", label: "COVID Stress Test", build: covidStress },
  { id: "no_sweep", label: "Cash Sweep Off", build: sweepOff },
  { id: "no_junior", label: "No Junior Debt", build: noJuniorDebt },
] as const;
