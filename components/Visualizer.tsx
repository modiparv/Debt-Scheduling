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
    <div className="flex flex-col lg:flex-row min-h-screen">
      <InputRail />
      <main className="flex-1 p-4 overflow-hidden">
        {storyOpen && <StoryMode onExit={() => setStoryOpen(false)} />}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <ScenarioPresets />
            <button
              onClick={() => setStoryOpen(true)}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-equity-700 text-white hover:bg-equity-500"
            >
              ▶ Story mode
            </button>
          </div>
          <CompareToggle />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
          <div className="h-[440px]">
            <CapitalStackPanel />
          </div>
          <div className="h-[440px]">
            <WaterfallPanel />
          </div>
          <div className="h-[400px]">
            <RollforwardPanel />
          </div>
          <div className="h-[400px]">
            <ReturnsPanel />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Explainer />
          </div>
          <CompareDelta />
        </div>

        <ShareExportBar />
      </main>
    </div>
  );
}
