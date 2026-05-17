import type { DealInputs } from "./types.ts";
import { baseCase, emptyStack } from "./scenarios.ts";

// Each story slide returns the FULL DealInputs to apply, plus the message.

export interface StorySlide {
  title: string;
  message: string;
  inputs: DealInputs;
}

function allCashDeal(): DealInputs {
  const base = baseCase();
  // Disable all debt; equity covers the entire purchase.
  const stack = base.stack.map((t) => ({ ...t, enabled: false, amount: 0 }));
  return {
    ...base,
    stack,
    equity: { sponsor: 950, mgmt: 0, newEquity: 0, mgmtPool: 0 },
    exit: { ...base.exit, sweepPct: 0 },
  };
}

function modestLeverage(): DealInputs {
  const base = baseCase();
  let stack = emptyStack();
  stack = stack.map((t) =>
    t.id === "tla" ? { ...t, enabled: true, amount: 300, amortPct: 0.10 } : t
  );
  return {
    ...base,
    stack,
    equity: { sponsor: 600, mgmt: 50, newEquity: 0, mgmtPool: 0 },
  };
}

function aggressiveLeverage(): DealInputs {
  const base = baseCase();
  let stack = emptyStack();
  stack = stack.map((t) => {
    if (t.id === "tla") return { ...t, enabled: true, amount: 200, amortPct: 0.10 };
    if (t.id === "tlb") return { ...t, enabled: true, amount: 200, amortPct: 0.01 };
    if (t.id === "sr_notes") return { ...t, enabled: true, amount: 150 };
    if (t.id === "mezz")
      return { ...t, enabled: true, amount: 150, pikYears: 5, kicker: 0.05 };
    return t;
  });
  return {
    ...base,
    stack,
    equity: { sponsor: 200, mgmt: 40, newEquity: 10, mgmtPool: 0.02 },
  };
}

function downturn(): DealInputs {
  const base = aggressiveLeverage();
  return {
    ...base,
    operating: {
      ...base.operating,
      revenueGrowth: -0.07,
      marginTrajectory: -0.005,
      ebitdaMargin: 0.22,
    },
  };
}

export const STORY_SLIDES: StorySlide[] = [
  {
    title: "Step 1: A $1M company, paid for in cash",
    message:
      "Here's a $1M company generating $319k of EBITDA — about a 32% margin. We're buying it for $950k. To start, let's pay all-equity: no debt at all. Click Next and we'll see what kind of return that gets us.",
    inputs: allCashDeal(),
  },
  {
    title: "Step 2: Add some debt — modest leverage",
    message:
      "Now we replace some of that equity with a $300k Term Loan A at 6%. Sponsor only puts in $600k. Watch the sponsor IRR jump — that's the magic of leverage. The business hasn't changed; we've just changed how we're funding it.",
    inputs: modestLeverage(),
  },
  {
    title: "Step 3: Crank the leverage to 11",
    message:
      "We go aggressive: TLA + TLB + Senior Notes + PIK Mezz, with sponsor only writing $200k of equity. IRR keeps climbing — but notice the mezz kicker is taking 5% of equity at exit. That's the cost of cheap debt: dilution.",
    inputs: aggressiveLeverage(),
  },
  {
    title: "Step 4: Now hit it with a downturn",
    message:
      "Same aggressive structure, but now we model a 7% revenue decline per year and shrinking margins. Watch the IRR collapse — and notice the revolver gets drawn to keep cash above the minimum. Leverage stays stubbornly high because there's no excess cash to sweep. This is how 2008 broke 2007 LBOs.",
    inputs: downturn(),
  },
  {
    title: "You've finished the tour.",
    message:
      "Now you can keep editing the inputs and feel the cause-and-effect for yourself. Try the other presets (Conservative, COVID, No Junior Debt) to see different stories, or build your own deal from scratch.",
    inputs: baseCase(),
  },
];
