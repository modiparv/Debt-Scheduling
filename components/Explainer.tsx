"use client";

import { useEffect, useState } from "react";
import { useDealStore } from "@/lib/store";
import { explain } from "@/lib/explainer";

export function Explainer() {
  const lastChange = useDealStore((s) => s.lastChange);
  const inputs = useDealStore((s) => s.inputs);
  const outputs = useDealStore((s) => s.outputs);

  const [prevInputs, setPrevInputs] = useState(inputs);

  useEffect(() => {
    const t = setTimeout(() => setPrevInputs(inputs), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastChange]);

  const exp = explain(lastChange, prevInputs, inputs, outputs);

  return (
    <div className="fin-card border-l-[3px] border-l-champagne">
      <div className="fin-eyebrow mb-3">What just happened</div>
      <div className="font-serif text-xl text-ink mb-2 tracking-tightish">
        {exp.headline}
      </div>
      <p className="text-[12px] text-mid leading-relaxed">{exp.detail}</p>
    </div>
  );
}
