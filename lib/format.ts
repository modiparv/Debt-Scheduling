// Small formatting helpers shared by the UI.

export function fmtMoney(n: number, digits = 0): string {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1000) {
    return `$${(n / 1000).toFixed(digits === 0 ? 1 : digits)}M`;
  }
  return `$${n.toFixed(digits)}k`;
}

export function fmtNum(n: number, digits = 1): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function fmtPct(n: number, digits = 1): string {
  if (!Number.isFinite(n)) return "—";
  return `${(n * 100).toFixed(digits)}%`;
}

export function fmtMult(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return "—";
  return `${n.toFixed(digits)}x`;
}

export function classNames(...xs: (string | false | null | undefined)[]): string {
  return xs.filter(Boolean).join(" ");
}
