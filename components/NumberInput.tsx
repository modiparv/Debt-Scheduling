"use client";

import { useState, useEffect } from "react";
import { classNames } from "@/lib/format";

interface Props {
  value: number;
  onChange: (n: number) => void;
  step?: number;
  min?: number;
  max?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  disabled?: boolean;
}

export function NumberInput({
  value,
  onChange,
  step = 1,
  min,
  max,
  prefix,
  suffix,
  className,
  disabled,
}: Props) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  const commit = (v: string) => {
    const n = parseFloat(v);
    if (!Number.isFinite(n)) {
      setText(String(value));
      return;
    }
    let clamped = n;
    if (min !== undefined) clamped = Math.max(min, clamped);
    if (max !== undefined) clamped = Math.min(max, clamped);
    onChange(clamped);
  };

  return (
    <div className={classNames("inline-flex items-center gap-1.5", className)}>
      {prefix && <span className="text-[10px] text-mid">{prefix}</span>}
      <input
        type="number"
        step={step}
        min={min}
        max={max}
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            commit((e.target as HTMLInputElement).value);
            (e.target as HTMLInputElement).blur();
          }
        }}
        className="fin-input w-full text-right tabular-nums"
      />
      {suffix && <span className="text-[10px] text-mid">{suffix}</span>}
    </div>
  );
}

interface SliderProps {
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step?: number;
  label: string;
  format?: (n: number) => string;
}

export function Slider({ value, onChange, min, max, step = 0.01, label, format }: SliderProps) {
  return (
    <label className="block">
      <div className="flex justify-between text-[11px] mb-1.5">
        <span className="fin-label">{label}</span>
        <span className="text-ink font-mono tabular-nums">
          {format ? format(value) : value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </label>
  );
}
