"use client";

import { create } from "zustand";
import { computeDeal } from "./lbo-engine";
import { baseCase, SCENARIO_PRESETS } from "./scenarios";
import type { DealInputs, DealOutputs, Tranche, TrancheId } from "./types";

interface DealStore {
  inputs: DealInputs;
  baseline: DealInputs | null;     // for "Compare" mode
  outputs: DealOutputs;
  compareMode: boolean;
  baselineOutputs: DealOutputs | null;
  lastChange: ChangeEvent | null;

  // setters
  setInputs: (next: DealInputs) => void;
  patchOperating: (patch: Partial<DealInputs["operating"]>) => void;
  patchExit: (patch: Partial<DealInputs["exit"]>) => void;
  patchEquity: (patch: Partial<DealInputs["equity"]>) => void;
  patchPurchase: (patch: { purchasePrice?: number; fees?: number; startingCash?: number }) => void;
  toggleTranche: (id: TrancheId, enabled: boolean) => void;
  patchTranche: (id: TrancheId, patch: Partial<Tranche>) => void;

  // presets / compare
  loadPreset: (id: string) => void;
  snapshotBaseline: () => void;
  clearBaseline: () => void;
  setCompareMode: (on: boolean) => void;
  resetToBase: () => void;
}

export type ChangeEvent =
  | { kind: "tranche"; id: TrancheId; field: keyof Tranche; from: number | boolean; to: number | boolean }
  | { kind: "operating"; field: keyof DealInputs["operating"]; from: number; to: number }
  | { kind: "exit"; field: keyof DealInputs["exit"]; from: number; to: number }
  | { kind: "equity"; field: keyof DealInputs["equity"]; from: number; to: number }
  | { kind: "preset"; id: string }
  | { kind: "purchase"; field: string; from: number; to: number };

function recompute(inputs: DealInputs): DealOutputs {
  return computeDeal(inputs);
}

export const useDealStore = create<DealStore>((set, get) => {
  const init = baseCase();
  return {
    inputs: init,
    baseline: null,
    outputs: recompute(init),
    compareMode: false,
    baselineOutputs: null,
    lastChange: null,

    setInputs: (next) => set({ inputs: next, outputs: recompute(next) }),

    patchOperating: (patch) => {
      const prev = get().inputs;
      const next = { ...prev, operating: { ...prev.operating, ...patch } };
      const field = Object.keys(patch)[0] as keyof DealInputs["operating"];
      set({
        inputs: next,
        outputs: recompute(next),
        lastChange: {
          kind: "operating",
          field,
          from: prev.operating[field] as number,
          to: next.operating[field] as number,
        },
      });
    },

    patchExit: (patch) => {
      const prev = get().inputs;
      const next = { ...prev, exit: { ...prev.exit, ...patch } };
      const field = Object.keys(patch)[0] as keyof DealInputs["exit"];
      set({
        inputs: next,
        outputs: recompute(next),
        lastChange: { kind: "exit", field, from: prev.exit[field], to: next.exit[field] },
      });
    },

    patchEquity: (patch) => {
      const prev = get().inputs;
      const next = { ...prev, equity: { ...prev.equity, ...patch } };
      const field = Object.keys(patch)[0] as keyof DealInputs["equity"];
      set({
        inputs: next,
        outputs: recompute(next),
        lastChange: { kind: "equity", field, from: prev.equity[field], to: next.equity[field] },
      });
    },

    patchPurchase: (patch) => {
      const prev = get().inputs;
      const next = { ...prev, ...patch };
      const [field, val] = Object.entries(patch)[0] as [string, number];
      set({
        inputs: next,
        outputs: recompute(next),
        lastChange: { kind: "purchase", field, from: (prev as any)[field], to: val },
      });
    },

    toggleTranche: (id, enabled) => {
      const prev = get().inputs;
      const stack = prev.stack.map((t) => (t.id === id ? { ...t, enabled } : t));
      const next = { ...prev, stack };
      set({
        inputs: next,
        outputs: recompute(next),
        lastChange: {
          kind: "tranche",
          id,
          field: "enabled",
          from: !enabled,
          to: enabled,
        },
      });
    },

    patchTranche: (id, patch) => {
      const prev = get().inputs;
      const stack = prev.stack.map((t) => (t.id === id ? { ...t, ...patch } : t));
      const next = { ...prev, stack };
      const field = Object.keys(patch)[0] as keyof Tranche;
      const before = prev.stack.find((t) => t.id === id);
      const after = stack.find((t) => t.id === id);
      set({
        inputs: next,
        outputs: recompute(next),
        lastChange: {
          kind: "tranche",
          id,
          field,
          from: (before as any)?.[field],
          to: (after as any)?.[field],
        },
      });
    },

    loadPreset: (id) => {
      const preset = SCENARIO_PRESETS.find((p) => p.id === id);
      if (!preset) return;
      const next = preset.build();
      set({
        inputs: next,
        outputs: recompute(next),
        lastChange: { kind: "preset", id },
      });
    },

    snapshotBaseline: () => {
      const cur = get().inputs;
      set({
        baseline: structuredClone(cur),
        baselineOutputs: recompute(cur),
        compareMode: true,
      });
    },

    clearBaseline: () => set({ baseline: null, baselineOutputs: null, compareMode: false }),

    setCompareMode: (on) => set({ compareMode: on }),

    resetToBase: () => {
      const next = baseCase();
      set({
        inputs: next,
        outputs: recompute(next),
        lastChange: { kind: "preset", id: "base" },
      });
    },
  };
});
