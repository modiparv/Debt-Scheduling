import type { DealInputs, Tranche } from "./types";

// Default tranche template — disabled. The presets override `enabled` and amounts.
export function emptyStack(): Tranche[] {
  return [
    {
      id: "existing",
      label: "Existing Debt (Assumed)",
      enabled: false,
      amount: 0,
      coupon: 0.06,
      maturity: 5,
      amortPct: 0.10,
      pikYears: 0,
      prepayable: true,
      kicker: 0,
      seniority: "senior",
      color: "#1F4DAA",
    },
    {
      id: "revolver",
      label: "Bank Revolver",
      enabled: false,
      amount: 0,
      coupon: 0.055,
      maturity: 6,
      amortPct: 0,
      pikYears: 0,
      prepayable: true,
      kicker: 0,
      seniority: "senior",
      color: "#3B6FD1",
    },
    {
      id: "tla",
      label: "Term Loan A",
      enabled: false,
      amount: 0,
      coupon: 0.06,
      maturity: 6,
      amortPct: 0.10,
      pikYears: 0,
      prepayable: true,
      kicker: 0,
      seniority: "senior",
      color: "#7AA8F0",
    },
    {
      id: "tlb",
      label: "Term Loan B",
      enabled: false,
      amount: 0,
      coupon: 0.07,
      maturity: 7,
      amortPct: 0.01,
      pikYears: 0,
      prepayable: true,
      kicker: 0,
      seniority: "senior",
      color: "#C7DBFE",
    },
    {
      id: "sr_notes",
      label: "Senior Notes",
      enabled: false,
      amount: 0,
      coupon: 0.08,
      maturity: 8,
      amortPct: 0,
      pikYears: 0,
      prepayable: true,
      kicker: 0,
      seniority: "senior",
      color: "#F08035",
    },
    {
      id: "sub_notes",
      label: "Subordinated Notes",
      enabled: false,
      amount: 0,
      coupon: 0.10,
      maturity: 9,
      amortPct: 0,
      pikYears: 0,
      prepayable: true,
      kicker: 0.01,
      seniority: "junior",
      color: "#FFB077",
    },
    {
      id: "mezz",
      label: "Mezzanine",
      enabled: false,
      amount: 0,
      coupon: 0.12,
      maturity: 10,
      amortPct: 0,
      pikYears: 3,
      prepayable: true,
      kicker: 0.03,
      seniority: "junior",
      color: "#FFDDBF",
    },
    {
      id: "seller",
      label: "Seller Notes",
      enabled: false,
      amount: 0,
      coupon: 0.05,
      maturity: 5,
      amortPct: 0.20,
      pikYears: 0,
      prepayable: true,
      kicker: 0,
      seniority: "junior",
      color: "#C25F1A",
    },
    {
      id: "preferred",
      label: "Preferred Stock",
      enabled: false,
      amount: 0,
      coupon: 0.10,
      maturity: 9,
      amortPct: 0,
      pikYears: 0,
      prepayable: false,
      kicker: 0.02,
      seniority: "preferred",
      color: "#7F3F8F",
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
// Reproduces the user's existing Excel model:
//   PP $950k, EBITDA $319k, exit Y9 @ 6.0x, sweep 100%
//   Cap stack: Revolver $200.9k, TLA $80k, TLB $55k, Sr Notes $65k,
//     Sub Notes $40k, Mezz $70k, Seller $25k, Existing $65k assumed,
//     Preferred $60k. Equity: Sponsor $220k, Mgmt $40k, New $25k.

export function baseCase(): DealInputs {
  let stack = emptyStack();
  stack = setTranche(stack, "existing", { amount: 65 });
  stack = setTranche(stack, "revolver", { amount: 200.9 });
  stack = setTranche(stack, "tla", { amount: 80 });
  stack = setTranche(stack, "tlb", { amount: 55 });
  stack = setTranche(stack, "sr_notes", { amount: 65 });
  stack = setTranche(stack, "sub_notes", { amount: 40, kicker: 0.01 });
  stack = setTranche(stack, "mezz", { amount: 70, kicker: 0.03 });
  stack = setTranche(stack, "seller", { amount: 25 });
  stack = setTranche(stack, "preferred", { amount: 60, kicker: 0.02 });

  return {
    purchasePrice: 950,
    fees: 0,
    startingCash: 25,
    operating: {
      revenueY1: 1000,
      revenueGrowth: 0.05,
      ebitdaMargin: 0.319,
      marginTrajectory: 0.003,
      capexPct: 0.04,
      nwcPct: 0.10,
      taxRate: 0.25,
      daPct: 0.04,
    },
    stack,
    equity: {
      sponsor: 220,
      mgmt: 40,
      newEquity: 25,
      mgmtPool: 0.02,
    },
    exit: {
      exitYear: 9,
      exitMultiple: 6.0,
      sweepPct: 1.0,
      minCash: 10,
    },
  };
}

// ---------- Preset scenarios ----------

export function conservativeLBO(): DealInputs {
  // Low leverage, all senior, modest growth.
  let stack = emptyStack();
  stack = setTranche(stack, "tla", { amount: 200, amortPct: 0.15 });
  stack = setTranche(stack, "tlb", { amount: 100 });
  stack = setTranche(stack, "revolver", { amount: 25 });

  return {
    purchasePrice: 950,
    fees: 0,
    startingCash: 25,
    operating: {
      revenueY1: 1000,
      revenueGrowth: 0.03,
      ebitdaMargin: 0.30,
      marginTrajectory: 0.002,
      capexPct: 0.04,
      nwcPct: 0.10,
      taxRate: 0.25,
      daPct: 0.04,
    },
    stack,
    equity: { sponsor: 500, mgmt: 80, newEquity: 45, mgmtPool: 0.02 },
    exit: { exitYear: 5, exitMultiple: 7.5, sweepPct: 1.0, minCash: 10 },
  };
}

export function aggressive2007(): DealInputs {
  // 7x leverage, heavy mezz, aggressive PIK.
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
    operating: {
      revenueY1: 1200,
      revenueGrowth: 0.07,
      ebitdaMargin: 0.27,
      marginTrajectory: 0.002,
      capexPct: 0.05,
      nwcPct: 0.12,
      taxRate: 0.25,
      daPct: 0.04,
    },
    stack,
    equity: { sponsor: 320, mgmt: 50, newEquity: 10, mgmtPool: 0.03 },
    exit: { exitYear: 7, exitMultiple: 8.0, sweepPct: 1.0, minCash: 20 },
  };
}

export function covidStress(): DealInputs {
  // Base deal but Y1-Y2 revenue declines.
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
  // Replace mezz + sub + preferred dollars with sponsor equity.
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
