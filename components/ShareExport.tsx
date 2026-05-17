"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import { useDealStore } from "@/lib/store";
import { encodeDeal } from "@/lib/url-encode";

export function ShareExportBar() {
  const inputs = useDealStore((s) => s.inputs);
  const [copied, setCopied] = useState(false);

  function copyShareUrl() {
    const url = `${window.location.origin}/visualizer?d=${encodeDeal(inputs)}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(inputs, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lbo-deal.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJson(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((txt) => {
      try {
        const parsed = JSON.parse(txt);
        useDealStore.getState().setInputs(parsed);
      } catch {
        alert("Could not parse deal JSON.");
      }
    });
  }

  return (
    <div className="fin-card mt-4 flex flex-wrap items-center gap-3">
      <button
        onClick={copyShareUrl}
        className="px-3 py-1.5 rounded text-xs font-semibold bg-navy text-white hover:bg-navySoft transition"
      >
        {copied ? "Link copied ✓" : "Copy share link"}
      </button>
      <button
        onClick={exportJson}
        className="px-3 py-1.5 rounded text-xs font-semibold border border-senior-300 text-navy hover:bg-senior-50"
      >
        Export JSON
      </button>
      <label className="px-3 py-1.5 rounded text-xs font-semibold border border-senior-300 text-navy hover:bg-senior-50 cursor-pointer">
        Import JSON
        <input type="file" accept="application/json" onChange={importJson} className="hidden" />
      </label>
      <button
        onClick={() => window.print()}
        className="px-3 py-1.5 rounded text-xs font-semibold border border-senior-300 text-navy hover:bg-senior-50"
      >
        Print / save PDF
      </button>
    </div>
  );
}
