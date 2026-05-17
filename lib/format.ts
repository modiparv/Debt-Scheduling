// Formatting helpers. All monetary inputs are in $ thousands ("k"),
// so $X.XXm = raw / 1000.

export function fmtMoney(n: number, decimals?: number): string {
  if (!Number.isFinite(n)) return "—";
  const m = n / 1000;
  const abs = Math.abs(m);
  let d = decimals;
  if (d === undefined) {
    if (abs >= 100) d = 1;
    else if (abs >= 10) d = 2;
    else d = 2;
  }
  if (abs < 0.005 && abs > 0) {
    return `${n < 0 ? "-" : ""}<$0.01m`;
  }
  const sign = m < 0 ? "-" : "";
  return `${sign}$${Math.abs(m).toFixed(d)}m`;
}

export function fmtMoneyShort(n: number): string {
  // Compact variant for axis labels.
  if (!Number.isFinite(n)) return "—";
  const m = n / 1000;
  const abs = Math.abs(m);
  const sign = m < 0 ? "-" : "";
  if (abs >= 10) return `${sign}$${Math.abs(m).toFixed(0)}m`;
  return `${sign}$${Math.abs(m).toFixed(1)}m`;
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
