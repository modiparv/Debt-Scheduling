// Quick smoke test runnable without npm install:
//   node --experimental-strip-types lib/smoke.mts
//
// Verifies the engine produces sensible numbers on the base case and
// comparison scenarios. Not a replacement for the Vitest suite.

import { computeDeal, totalSources, totalUses } from "./lbo-engine.ts";
import {
  baseCase,
  sweepOff,
  noJuniorDebt,
  conservativeLBO,
  aggressive2007,
  covidStress,
} from "./scenarios.ts";

const fmt = (n: number, d = 2) =>
  Number.isFinite(n) ? n.toFixed(d) : String(n);
const pct = (n: number) =>
  Number.isFinite(n) ? (n * 100).toFixed(1) + "%" : "n/a";

function dump(label: string, builder: () => ReturnType<typeof baseCase>) {
  const inp = builder();
  const out = computeDeal(inp);
  const sources = totalSources(inp);
  const uses = totalUses(inp);
  console.log(`\n=== ${label} ===`);
  console.log(
    `Sources ${fmt(sources)} / Uses ${fmt(uses)} / Gap ${fmt(sources - uses)}`
  );
  console.log(
    `Exit Yr ${out.exit.year} | EV ${fmt(out.exit.enterpriseValue)} | NetDebt ${fmt(out.exit.netDebt)} | Cash ${fmt(out.exit.cashAtExit)} | Equity ${fmt(out.exit.equityValue)}`
  );
  console.log(
    `Sponsor IRR ${pct(out.sponsorIRR)} | MOIC ${fmt(out.sponsorMOIC)}x`
  );
  console.log(
    `Sensitivity: Bear@${out.sensitivity.bear.multiple}x ${pct(out.sensitivity.bear.irr)} | Base ${pct(out.sensitivity.base.irr)} | Bull@${out.sensitivity.bull.multiple}x ${pct(out.sensitivity.bull.irr)}`
  );

  const rows = out.years;
  console.log(
    "Yr  Revenue   EBITDA   Lev   TotalDebt  Cash    Mandatory  Sweep"
  );
  for (const r of rows) {
    console.log(
      `${String(r.year).padStart(2)}  ${fmt(r.revenue).padStart(7)}  ${fmt(r.ebitda).padStart(6)}  ${fmt(r.leverageRatio).padStart(4)}x  ${fmt(r.totalDebt).padStart(8)}   ${fmt(r.endingCash).padStart(6)}  ${fmt(r.mandatoryAmort).padStart(8)}  ${fmt(r.sweepPool).padStart(6)}`
    );
  }
}

dump("BASE", baseCase);
dump("SWEEP OFF", sweepOff);
dump("NO JUNIOR DEBT", noJuniorDebt);
dump("CONSERVATIVE", conservativeLBO);
dump("AGGRESSIVE 2007", aggressive2007);
dump("COVID STRESS", covidStress);
