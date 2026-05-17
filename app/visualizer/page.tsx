"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Visualizer } from "@/components/Visualizer";
import { useDealStore } from "@/lib/store";
import { decodeDeal } from "@/lib/url-encode";

function VisualizerWithParams() {
  const params = useSearchParams();
  const setInputs = useDealStore((s) => s.setInputs);

  useEffect(() => {
    const token = params.get("d");
    if (token) {
      const decoded = decodeDeal(token);
      if (decoded) setInputs(decoded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Visualizer />;
}

export default function VisualizerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-navy">Loading deal…</div>}>
      <VisualizerWithParams />
    </Suspense>
  );
}
