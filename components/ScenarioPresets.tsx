"use client";

import { useDealStore } from "@/lib/store.ts";
import { SCENARIO_PRESETS } from "@/lib/scenarios.ts";

export function ScenarioPresets() {
  const loadPreset = useDealStore((s) => s.loadPreset);
  return (
    <div className="flex flex-wrap gap-2">
      <span className="fin-label self-center mr-1">Presets:</span>
      {SCENARIO_PRESETS.map((p) => (
        <button
          key={p.id}
          onClick={() => loadPreset(p.id)}
          className="px-3 py-1 rounded-full text-xs font-medium bg-white border border-senior-100 hover:bg-senior-50 hover:border-senior-300 text-navy transition"
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
