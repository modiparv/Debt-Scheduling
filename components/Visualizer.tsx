"use client";

import { useState } from "react";
import { InputRail } from "./InputRail";
import { ScenarioPresets } from "./ScenarioPresets";
import { Explainer } from "./Explainer";
import { CompareToggle, CompareDelta } from "./CompareToggle";
import { CapitalStackPanel } from "./panels/CapitalStackPanel";
import { WaterfallPanel } from "./panels/WaterfallPanel";
import { RollforwardPanel } from "./panels/RollforwardPanel";
import { ReturnsPanel } from "./panels/ReturnsPanel";
import { ShareExportBar } from "./ShareExport";
import { StoryMode } from "./StoryMode";

export function Visualizer() {
  const [storyOpen, setStoryOpen] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-platinum/40">
      <InputRail />
      <main className="flex-1 px-6 lg:px-10 py-8 overflow-hidden space-y-6">
        {storyOpen && <StoryMode onExit={() => setStoryOpen(false)} />}

        <header className="flex flex-wrap items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-4 flex-wrap">
            <ScenarioPresets />
            <button
              onClick={() => setStoryOpen(true)}
              className="text-[11px] uppercase tracking-wider2 text-mid hover:text-ink border border-silver hover:border-mid px-3 py-1 rounded-full transition-colors"
            >
              ▸ Story mode
            </button>
          </div>
          <CompareToggle />
        </header>

        {/* 1. Outcome on top */}
        <section className="h-[300px]">
          <ReturnsPanel />
        </section>

        {/* 2. Capital stack — wider canvas */}
        <section className="h-[520px]">
          <CapitalStackPanel />
        </section>

        {/* 3. Rollforward — wider canvas */}
        <section className="h-[480px]">
          <RollforwardPanel />
        </section>

        {/* 4. Waterfall as the drill-down */}
        <section className="h-[640px]">
          <WaterfallPanel />
        </section>

        {/* 5. Explainer + compare */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Explainer />
          </div>
          <CompareDelta />
        </section>

        <ShareExportBar />
      </main>
    </div>
  );
}
