"use client";

import { useDealStore } from "@/lib/store";
import { SCENARIO_PRESETS } from "@/lib/scenarios";
import { classNames } from "@/lib/format";

export function ScenarioPresets() {
  const loadPreset = useDealStore((s) => s.loadPreset);
  const lastChange = useDealStore((s) => s.lastChange);
  const activeId =
    lastChange && lastChange.kind === "preset" ? lastChange.id : null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="fin-eyebrow mr-1">Presets</span>
      {SCENARIO_PRESETS.map((p) => (
        <button
          key={p.id}
          onClick={() => loadPreset(p.id)}
          className={classNames(
            "fin-pill",
            activeId === p.id && "fin-pill-active"
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
