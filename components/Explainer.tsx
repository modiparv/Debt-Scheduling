"use client";

import { useDealStore } from "@/lib/store";
import { explain } from "@/lib/explainer";
import { useEffect, useState } from "react";

export function Explainer() {
  const lastChange = useDealStore((s) => s.lastChange);
  const inputs = useDealStore((s) => s.inputs);
  const outputs = useDealStore((s) => s.outputs);

  const [prevInputs, setPrevInputs] = useState(inputs);

  useEffect(() => {
    // Capture inputs before next change for delta calc. Synchronous "before"
    // is impossible without a side-channel, so we snapshot AFTER each render
    // and use it on the next change. Good enough for the educational signal.
    const t = setTimeout(() => setPrevInputs(inputs), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastChange]);

  const exp = explain(lastChange, prevInputs, inputs, outputs);

  return (
    <div className="fin-card border-l-4 border-l-equity-500">
      <div className="fin-label mb-1">What just happened?</div>
      <div className="text-sm font-semibold text-navy mb-1">{exp.headline}</div>
      <div className="text-sm text-navySoft">{exp.detail}</div>
    </div>
  );
}
