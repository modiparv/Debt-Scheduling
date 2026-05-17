"use client";

import { useState } from "react";
import { TopNav } from "./TopNav";
import { InputRail } from "./InputRail";
import { ScenarioPresets } from "./ScenarioPresets";
import { Explainer } from "./Explainer";
import { CompareToggle, CompareDelta } from "./CompareToggle";
import { CapitalStackPanel } from "./panels/CapitalStackPanel";
import { WaterfallPanel } from "./panels/WaterfallPanel";
import { RollforwardPanel } from "./panels/RollforwardPanel";
import { ReturnsPanel } from "./panels/ReturnsPanel";
import { SensitivityPanel } from "./panels/SensitivityPanel";
import { AssumptionsPanel } from "./panels/AssumptionsPanel";
import { ShareExportBar } from "./ShareExport";
import { StoryMode } from "./StoryMode";

export function Visualizer() {
  const [storyOpen, setStoryOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-platinum/40">
      <TopNav active="visualizer" />

      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        <InputRail />

        <main className="flex-1 px-6 lg:px-10 py-6 lg:py-8 overflow-x-hidden space-y-6 max-w-[1400px] mx-auto w-full">
          {storyOpen && <StoryMode onExit={() => setStoryOpen(false)} />}

          {/* Compact action bar — single row on desktop */}
          <header className="flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-2 flex-wrap">
              <ScenarioPresets />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setStoryOpen(true)}
                className="fin-pill"
              >
                ▸ Story mode
              </button>
              <CompareToggle />
            </div>
          </header>

          <SectionLabel index="①" title="Return Outcome" subtitle="What this deal produces — the headline IRR and the slices that take it home." />
          <section className="min-h-[320px]">
            <ReturnsPanel />
          </section>

          <SectionLabel index="②" title="Capital Stack" subtitle="The structure that produced the outcome — at close and at exit. Hover any tranche for the details." />
          <section className="h-[520px]">
            <CapitalStackPanel />
          </section>

          <SectionLabel index="③" title="Tranche Rollforward" subtitle="How each tranche evolves year-by-year. Leverage on the right axis." />
          <section className="h-[460px]">
            <RollforwardPanel />
          </section>

          <SectionLabel index="④" title="Model Assumptions" subtitle="Every driver feeding the math, surfaced in one place. WACC, DCF inputs, capital stack details." />
          <section className="min-h-[640px]">
            <AssumptionsPanel />
          </section>

          <SectionLabel index="⑤" title="Cash Waterfall" subtitle="The year-by-year mechanics. Drag the scrubber to walk through the hold." />
          <section className="min-h-[800px]">
            <WaterfallPanel />
          </section>

          <SectionLabel index="⑥" title="Sensitivity / Scenario Analysis" subtitle="Sponsor IRR across exit multiple × exit year. The current deal is outlined." />
          <section className="min-h-[420px]">
            <SensitivityPanel />
          </section>

          <SectionLabel index="⑦" title="What just happened?" subtitle="Plain-English read on your last edit." />
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Explainer />
            </div>
            <CompareDelta />
          </section>

          <ShareExportBar />
        </main>
      </div>
    </div>
  );
}

function SectionLabel({
  index,
  title,
  subtitle,
}: {
  index: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-baseline gap-3 pt-2 no-print">
      <span className="font-serif text-xl text-champagneDeep leading-none">{index}</span>
      <div>
        <div className="font-serif text-lg text-ink tracking-tightish leading-none">
          {title}
        </div>
        <div className="text-[11px] text-mid mt-1">{subtitle}</div>
      </div>
    </div>
  );
}
