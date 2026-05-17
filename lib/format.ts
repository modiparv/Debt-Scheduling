// Formatting helpers. All monetary inputs are in $ millions (raw → "$X.XXm").

export function fmtMoney(n: number, decimals?: number): string {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  let d = decimals;
  if (d === undefined) {
    if (abs >= 100) d = 1;
    else if (abs >= 10) d = 2;
    else d = 2;
  }
  if (abs > 0 && abs < 0.005) {
    return `${n < 0 ? "-" : ""}<$0.01m`;
  }
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toFixed(d)}m`;
}

export function fmtMoneyShort(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 10) return `${sign}$${abs.toFixed(0)}m`;
  return `${sign}$${abs.toFixed(1)}m`;
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
