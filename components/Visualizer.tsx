"use client";

import { InputRail } from "./InputRail.tsx";
import { ScenarioPresets } from "./ScenarioPresets.tsx";
import { Explainer } from "./Explainer.tsx";
import { CompareToggle, CompareDelta } from "./CompareToggle.tsx";
import { CapitalStackPanel } from "./panels/CapitalStackPanel.tsx";
import { WaterfallPanel } from "./panels/WaterfallPanel.tsx";
import { RollforwardPanel } from "./panels/RollforwardPanel.tsx";
import { ReturnsPanel } from "./panels/ReturnsPanel.tsx";
import { ShareExportBar } from "./ShareExport.tsx";

export function Visualizer() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <InputRail />
      <main className="flex-1 p-4 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <ScenarioPresets />
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
