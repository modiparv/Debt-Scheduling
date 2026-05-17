# LBO Debt Scheduling Visualizer

Interactive, in-browser tool that isolates the **debt waterfall** mechanics of an LBO
so users can feel the cause-and-effect between capital-stack design and equity IRR by
editing inputs live and watching the visualizations update in real time.

## Stack

- Next.js 14 (app router) + TypeScript
- Tailwind CSS (finance-model aesthetic: cream input cells, navy headers, blue editable values)
- Recharts for stacked bars, line charts, waterfall flow
- Zustand for the deal store
- Pure-TS computation engine (`lib/lbo-engine.ts`) with Vitest unit tests
- No backend; everything runs client-side

## Scripts

```bash
npm install
npm run dev        # http://localhost:3000
npm run test       # run engine unit tests
npm run typecheck
npm run build
```

## Architecture

```
app/
  page.tsx              landing + deal setup + cap stack builder
  visualizer/page.tsx   main 4-panel dashboard
components/
  panels/               CapitalStack, Waterfall, Rollforward, Returns
  InputRail.tsx         left-rail accordion of editable inputs
  ScenarioPresets.tsx   one-click preset deals
  Explainer.tsx         plain-English "what just happened?" box
lib/
  lbo-engine.ts         pure computation: balances, waterfall, IRR
  lbo-engine.test.ts    verifies the reference base case
  scenarios.ts          preset deals
  store.ts              Zustand store
  irr.ts                Newton-Raphson IRR solver
  url-encode.ts         URL share encoding
```

## Engine model

Per-year loop replicating the reference Excel:

1. **Operating block** — revenue, EBITDA, EBIT, taxes, net income
2. **Cash flow** — CFO + CFI = pre-financing cash
3. **Block 2 — Mandatory amortization** per tranche (TLA, TLB straight-line; Existing Debt; Seller; Preferred at retire year)
4. **Block 3 — Revolver gate** — if cash short, draw revolver; if surplus, advance to cascade
5. **Block 4 — Optional prepayment cascade** — sweep% of excess cash applied senior-to-junior
6. **Roll forward** balances; interest on beginning-of-year balance (no circularity)
7. **Exit** — EV = exit EBITDA × multiple; equity value = EV − net debt; allocate by undiluted + diluted shares (kickers from Sub / Mezz / Pref)
8. **IRR / MOIC** per security via Newton-Raphson

## Reference test case

The default scenario reproduces the user's existing Excel model and is asserted by
`lib/lbo-engine.test.ts`:

| Output             | Expected |
| ------------------ | -------- |
| Sponsor IRR        | ~27%     |
| Sponsor MOIC       | ~3.4x    |
| Equity Value @ exit| ~$2.96M  |
