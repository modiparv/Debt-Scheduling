"use client";

import { useState } from "react";
import { useDealStore } from "@/lib/store.ts";
import { STORY_SLIDES } from "@/lib/story.ts";
import { fmtPct, fmtMult, fmtMoney } from "@/lib/format.ts";

export function StoryMode({ onExit }: { onExit: () => void }) {
  const [idx, setIdx] = useState(0);
  const setInputs = useDealStore((s) => s.setInputs);
  const outputs = useDealStore((s) => s.outputs);

  const slide = STORY_SLIDES[idx];

  // Apply slide inputs when slide changes.
  const apply = (i: number) => {
    setIdx(i);
    setInputs(STORY_SLIDES[i].inputs);
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-cream rounded-xl shadow-2xl max-w-2xl w-full p-6 border-2 border-navy">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="fin-label">
              Story mode · Slide {idx + 1} of {STORY_SLIDES.length}
            </div>
            <h2 className="text-xl font-bold text-navy mt-1">{slide.title}</h2>
          </div>
          <button
            onClick={onExit}
            className="text-navySoft hover:text-navy"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="text-navy mb-5">{slide.message}</p>

        <div className="grid grid-cols-3 gap-3 mb-5 bg-white rounded-lg p-4 border border-senior-100">
          <Metric label="Sponsor IRR" value={fmtPct(outputs.sponsorIRR)} />
          <Metric label="MOIC" value={fmtMult(outputs.sponsorMOIC)} />
          <Metric label="Equity @ Exit" value={fmtMoney(outputs.exit.equityValue)} />
        </div>

        <div className="flex justify-between items-center">
          <button
            disabled={idx === 0}
            onClick={() => apply(idx - 1)}
            className="px-4 py-2 rounded text-sm font-semibold border border-senior-300 text-navy disabled:opacity-30 hover:bg-senior-50"
          >
            ← Back
          </button>
          <div className="flex gap-1">
            {STORY_SLIDES.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === idx ? "bg-navy" : "bg-senior-300"
                }`}
              />
            ))}
          </div>
          {idx < STORY_SLIDES.length - 1 ? (
            <button
              onClick={() => apply(idx + 1)}
              className="px-4 py-2 rounded text-sm font-semibold bg-navy text-white hover:bg-navySoft"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={onExit}
              className="px-4 py-2 rounded text-sm font-semibold bg-equity-700 text-white hover:bg-equity-500"
            >
              Done — start exploring
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="fin-label">{label}</div>
      <div className="text-2xl font-bold font-mono text-navy">{value}</div>
    </div>
  );
}
