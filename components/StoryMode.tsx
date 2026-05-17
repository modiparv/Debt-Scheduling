"use client";

import { useState } from "react";
import { useDealStore } from "@/lib/store";
import { STORY_SLIDES } from "@/lib/story";
import { fmtPct, fmtMult, fmtMoney } from "@/lib/format";

export function StoryMode({ onExit }: { onExit: () => void }) {
  const [idx, setIdx] = useState(0);
  const setInputs = useDealStore((s) => s.setInputs);
  const outputs = useDealStore((s) => s.outputs);

  const slide = STORY_SLIDES[idx];

  const apply = (i: number) => {
    setIdx(i);
    setInputs(STORY_SLIDES[i].inputs);
  };

  return (
    <div className="fixed inset-0 z-40 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-xl shadow-card max-w-2xl w-full p-8 border border-silver">
        <div className="flex justify-between items-start mb-5">
          <div>
            <div className="fin-eyebrow">
              Story · {idx + 1} of {STORY_SLIDES.length}
            </div>
            <h2 className="font-serif text-2xl text-ink mt-2 tracking-tightish">
              {slide.title}
            </h2>
          </div>
          <button
            onClick={onExit}
            className="text-mid hover:text-ink transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="text-[13px] text-graphite mb-6 leading-relaxed">
          {slide.message}
        </p>

        <div className="grid grid-cols-3 gap-4 mb-6 py-5 border-y border-silver">
          <Metric label="Sponsor IRR" value={fmtPct(outputs.sponsorIRR)} />
          <Metric label="MOIC" value={fmtMult(outputs.sponsorMOIC)} />
          <Metric label="Equity at Exit" value={fmtMoney(outputs.exit.equityValue)} />
        </div>

        <div className="flex justify-between items-center">
          <button
            disabled={idx === 0}
            onClick={() => apply(idx - 1)}
            className="text-[11px] uppercase tracking-wider2 text-mid border border-silver px-4 py-2 rounded-full hover:text-ink hover:border-mid disabled:opacity-30 disabled:hover:text-mid disabled:hover:border-silver transition-colors"
          >
            ← Back
          </button>
          <div className="flex gap-1.5">
            {STORY_SLIDES.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === idx ? "bg-ink" : "bg-silver"
                }`}
              />
            ))}
          </div>
          {idx < STORY_SLIDES.length - 1 ? (
            <button
              onClick={() => apply(idx + 1)}
              className="text-[11px] uppercase tracking-wider2 text-white bg-ink border border-ink px-4 py-2 rounded-full hover:bg-charcoal transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={onExit}
              className="text-[11px] uppercase tracking-wider2 text-charcoal bg-champagne border border-champagne px-4 py-2 rounded-full hover:bg-champagneDeep hover:text-white transition-colors"
            >
              Start exploring
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
      <div className="fin-eyebrow mb-1">{label}</div>
      <div className="font-serif text-2xl text-ink tabular-nums">{value}</div>
    </div>
  );
}
