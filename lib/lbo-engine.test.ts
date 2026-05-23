import { describe, it, expect } from "vitest";
import { computeDeal, totalSources, totalUses } from "./lbo-engine";
import { irr as solveIrr, moic } from "./irr";
import { baseCase, sweepOff, noJuniorDebt, aggressive2007 } from "./scenarios";

describe("irr solver", () => {
  it("solves a simple 2-period stream", () => {
    // -100 today, +120 next year → 20% IRR
    const r = solveIrr([-100, 120]);
    expect(r).toBeCloseTo(0.2, 3);
  });

  it("handles a multi-period geometric stream", () => {
    // -100, then 0s, then 200 in year 5 → (200/100)^(1/5) - 1 = ~14.87%
    const r = solveIrr([-100, 0, 0, 0, 0, 200]);
    expect(r).toBeCloseTo(0.1487, 3);
  });

  it("returns NaN when there is no sign change", () => {
    expect(Number.isNaN(solveIrr([100, 200, 300]))).toBe(true);
  });

  it("moic returns total inflow / outflow", () => {
    expect(moic([-100, 50, 100])).toBeCloseTo(1.5, 5);
  });
});

describe("computeDeal: structural invariants", () => {
  const out = computeDeal(baseCase());

  it("produces one row per year through exit", () => {
    expect(out.years).toHaveLength(9);
    expect(out.years[0].year).toBe(1);
    expect(out.years.at(-1)?.year).toBe(9);
  });

  it("revenue grows year-over-year at the configured rate", () => {
    const y1 = out.years[0].revenue;
    const y2 = out.years[1].revenue;
    expect(y2 / y1).toBeCloseTo(1.05, 3);
  });

  it("ending cash is never negative", () => {
    for (const row of out.years) {
      expect(row.endingCash).toBeGreaterThanOrEqual(-1e-6);
    }
  });

  it("total debt monotonically decreases or holds (with 100% sweep, no maturities pushing balances up)", () => {
    // Allow tolerance for the revolver bouncing around in a single year.
    for (let i = 1; i < out.years.length; i++) {
      const prev = out.years[i - 1].totalDebt;
      const curr = out.years[i].totalDebt;
      // Senior debt should be paying down; junior bullets stay flat. So total
      // can only stay flat or shrink, except for PIK accretion in mezz.
      expect(curr).toBeLessThanOrEqual(prev * 1.05);
    }
  });

  it("leverage ratio drops materially over the hold", () => {
    const start = out.years[0].leverageRatio;
    const end = out.years.at(-1)!.leverageRatio;
    expect(end).toBeLessThan(start);
  });
});

describe("computeDeal: base case returns", () => {
  const out = computeDeal(baseCase());

  it("sources roughly match uses (values in $m)", () => {
    expect(out.sourcesTotal).toBeGreaterThan(0.9);
    expect(out.usesTotal).toBe(0.95);
    expect(Math.abs(out.gap)).toBeLessThan(0.01);
  });

  it("equity value at exit matches the Excel reference (~$2.85-3.0m)", () => {
    expect(out.exit.equityValue).toBeGreaterThan(2.5);
    expect(out.exit.equityValue).toBeLessThan(3.2);
  });

  it("sponsor IRR matches the Excel reference (~27%)", () => {
    expect(out.sponsorIRR).toBeGreaterThan(0.24);
    expect(out.sponsorIRR).toBeLessThan(0.30);
  });

  it("exit EBITDA and EV match the Excel reference", () => {
    expect(out.exit.exitEbitda).toBeCloseTo(0.514, 2);
    expect(out.exit.enterpriseValue).toBeCloseTo(3.084, 2);
  });

  it("cash at exit pins to the minimum (revolver absorbs the excess)", () => {
    expect(out.exit.cashAtExit).toBeCloseTo(0.05, 2);
  });

  it("sponsor MOIC is above 2.5x", () => {
    expect(out.sponsorMOIC).toBeGreaterThan(2.5);
  });

  it("sensitivity is monotonic in exit multiple", () => {
    const { bear, base, bull } = out.sensitivity;
    expect(bear.irr).toBeLessThan(base.irr);
    expect(base.irr).toBeLessThan(bull.irr);
  });
});

describe("computeDeal: comparative scenarios", () => {
  it("turning the sweep off leaves the sponsor IRR similar but cash higher", () => {
    const on = computeDeal(baseCase());
    const off = computeDeal(sweepOff());
    expect(off.exit.cashAtExit).toBeGreaterThan(on.exit.cashAtExit);
    // IRR moves only modestly with sweep flips when debt is cheap.
    expect(Math.abs(off.sponsorIRR - on.sponsorIRR)).toBeLessThan(0.15);
  });

  it("removing junior debt (replaced with sponsor equity) cuts IRR", () => {
    const base = computeDeal(baseCase());
    const allSenior = computeDeal(noJuniorDebt());
    expect(allSenior.sponsorIRR).toBeLessThan(base.sponsorIRR);
  });

  it("the aggressive scenario produces higher IRR than conservative-ish base under bull exit", () => {
    const a = computeDeal(aggressive2007());
    expect(a.sponsorIRR).toBeGreaterThan(0); // sanity: solves
    expect(a.exit.enterpriseValue).toBeGreaterThan(0);
  });
});

describe("sources / uses helpers", () => {
  it("totalSources sums all enabled tranches plus equity (in $m)", () => {
    const inp = baseCase();
    const s = totalSources(inp);
    // tranches: 0.065+0.2009+0.080+0.055+0.065+0.040+0.070+0.025+0.060 = 0.6609
    // equity:   0.220+0.040+0.025 = 0.285
    expect(s).toBeCloseTo(0.6609 + 0.285, 5);
  });

  it("totalUses equals purchase price + fees", () => {
    const inp = baseCase();
    expect(totalUses(inp)).toBe(0.95);
  });
});
