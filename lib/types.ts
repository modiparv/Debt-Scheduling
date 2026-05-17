// Shared types for the LBO engine and UI.

export type TrancheId =
  | "existing"
  | "revolver"
  | "tla"
  | "tlb"
  | "sr_notes"
  | "sub_notes"
  | "mezz"
  | "seller"
  | "preferred";

export type Seniority = "senior" | "junior" | "preferred";

export interface Tranche {
  id: TrancheId;
  label: string;
  enabled: boolean;
  amount: number;        // initial $ balance
  coupon: number;        // annual interest / dividend rate
  maturity: number;      // years from close until bullet payoff
  amortPct: number;      // annual mandatory amort as % of ORIGINAL principal
  pikYears: number;      // years from close during which interest is PIK
  prepayable: boolean;   // included in the cash-sweep cascade
  kicker: number;        // equity kicker % (Sub / Mezz / Pref)
  seniority: Seniority;
  color: string;         // tailwind color token (for charts)
}

export interface OperatingInputs {
  revenueY1: number;
  revenueGrowth: number;     // annual %
  ebitdaMargin: number;      // Y1 margin
  marginTrajectory: number;  // annual delta to margin (e.g. +0.005 = +50bps/yr)
  capexPct: number;          // % of revenue
  nwcPct: number;            // % of revenue (incremental NWC = pct * revenue delta)
  taxRate: number;
  daPct: number;             // D&A as % of revenue (simplification)
}

export interface EquityInputs {
  sponsor: number;
  mgmt: number;
  newEquity: number;
  mgmtPool: number;          // performance pool kicker % (of fully-diluted equity)
  newEquityKicker?: number;  // optional extra kicker for new-equity investors
}

export interface ExitInputs {
  exitYear: number;
  exitMultiple: number;
  sweepPct: number;          // 0..1
  minCash: number;
}

export interface DividendInputs {
  // Common cash dividends paid pro-rata to undiluted equity holders
  commonDivY1: number;     // Y1 amount
  commonDivGrowth: number; // annual %
  otherDivPerYear: number; // additional flat dividend (e.g. preferred-like)
}

export interface DealInputs {
  purchasePrice: number;
  fees: number;
  startingCash: number;
  revolverLimit: number;       // commitment cap on the revolver
  nolBalance: number;          // beginning Net Operating Loss carry-forward
  operating: OperatingInputs;
  stack: Tranche[];
  equity: EquityInputs;
  exit: ExitInputs;
  dividends: DividendInputs;
}

export interface YearRow {
  year: number;
  revenue: number;
  ebitda: number;
  da: number;
  ebit: number;
  interest: number;
  taxes: number;
  netIncome: number;
  capex: number;
  nwcChange: number;
  cfo: number;
  cfi: number;
  preFinancing: number;
  dividendsPaid: number;       // cash dividends to equity holders this year
  mandatoryAmort: number;
  revolverDraw: number;
  sweepPool: number;
  appliedToCascade: number;
  endingCash: number;
  totalDebt: number;
  leverageRatio: number;
  trancheBalances: Record<TrancheId, number>;
  trancheInterest: Record<TrancheId, number>;
  tranchePrincipal: Record<TrancheId, number>;
  trancheMandatory: Record<TrancheId, number>;
  trancheOptional: Record<TrancheId, number>;
}

export interface EquityHolder {
  id: string;
  label: string;
  invested: number;         // $ in at close (0 for kicker-only holders)
  sharePct: number;         // % of fully-diluted equity
  exitValue: number;        // $ received at exit
  irr: number;
  moic: number;
}

export interface DealOutputs {
  years: YearRow[];
  sourcesTotal: number;
  usesTotal: number;
  gap: number;              // sources - uses (should be 0)
  exit: {
    year: number;
    exitEbitda: number;
    enterpriseValue: number;
    netDebt: number;
    cashAtExit: number;
    equityValue: number;
  };
  holders: EquityHolder[];
  sponsorIRR: number;
  sponsorMOIC: number;
  sensitivity: {
    bear: { multiple: number; irr: number };
    base: { multiple: number; irr: number };
    bull: { multiple: number; irr: number };
  };
}
