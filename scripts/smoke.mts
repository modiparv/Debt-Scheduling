// Verify the engine produces numbers close to the reference Excel.
// Run with: node --experimental-strip-types scripts/smoke.mts
//
// Excel reference targets (from IRR_Returns!C36 and M22):
//   Sponsor IRR  ~ 27.37%
//   Sponsor MOIC ~ 8.5x (exit allocation / investment, ignoring dividends)
//   Equity Value ~ $2.965M

import { computeDeal, totalSources, totalUses, buildSensitivityGrid } from "../lib/lbo-engine.ts";
import { baseCase } from "../lib/scenarios.ts";

const fmt = (n: number, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : String(n));
const pct = (n: number) => (Number.isFinite(n) ? (n * 100).toFixed(2) + "%" : "n/a");

const inp = baseCase();
const out = computeDeal(inp);

console.log("=== BASE CASE vs Excel reference ===");
console.log(`Sources ${fmt(totalSources(inp))} / Uses ${fmt(totalUses(inp))} / Gap ${fmt(totalSources(inp) - totalUses(inp))}`);
console.log(`Exit EBITDA      ${fmt(out.exit.exitEbitda)}   (Excel: ~$514)`);
console.log(`Enterprise Value ${fmt(out.exit.enterpriseValue)}   (Excel: ~$3,084)`);
console.log(`Net debt at exit ${fmt(out.exit.netDebt)}   (Excel: ~$170 - $50 cash = $120)`);
console.log(`Equity Value     ${fmt(out.exit.equityValue)}   (Excel: ~$2,965)`);
console.log(`Sponsor IRR  ${pct(out.sponsorIRR)}   (Excel: 27.37%)`);
console.log(`Sponsor MOIC ${fmt(out.sponsorMOIC)}x`);
console.log();

console.log("Holders:");
for (const h of out.holders) {
  console.log(
    `  ${h.label.padEnd(28)} inv=${fmt(h.invested, 1).padStart(6)} share=${pct(h.sharePct).padStart(7)} exitVal=${fmt(h.exitValue, 1).padStart(8)} IRR=${pct(h.irr).padStart(7)}`
  );
}

console.log("\nYear-by-year:");
console.log("Yr  Rev      EBITDA  NI     CFO    Capex  Div   Mand   RevDr  Sweep  Cash    Debt    Lev");
for (const r of out.years) {
  console.log(
    `${String(r.year).padStart(2)}  ${fmt(r.revenue).padStart(7)}  ${fmt(r.ebitda).padStart(6)}  ${fmt(r.netIncome).padStart(5)}  ${fmt(r.cfo).padStart(5)}  ${fmt(-r.cfi).padStart(5)}  ${fmt(r.dividendsPaid).padStart(4)}  ${fmt(r.mandatoryAmort).padStart(5)}  ${fmt(r.revolverDraw).padStart(5)}  ${fmt(r.sweepPool).padStart(5)}  ${fmt(r.endingCash).padStart(6)}  ${fmt(r.totalDebt).padStart(6)}  ${fmt(r.leverageRatio).padStart(4)}x`
  );
}

console.log("\nSensitivity grid (Sponsor IRR):");
const grid = buildSensitivityGrid(inp);
console.log("Mult \\ Yr  " + grid.yearAxis.map(y => `Y${y}`.padStart(7)).join(""));
for (let m = 0; m < grid.multipleAxis.length; m++) {
  const row = grid.irrs[m].map(v => pct(v).padStart(7)).join("");
  console.log(`${fmt(grid.multipleAxis[m], 1).padStart(4)}x      ${row}`);
}
