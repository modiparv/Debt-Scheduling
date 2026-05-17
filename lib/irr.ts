// Newton-Raphson IRR solver for an array of yearly cash flows.
// cashflows[0] is the t=0 investment (typically negative).
// Returns NaN if it can't converge or if the stream has no sign change.

export function irr(cashflows: number[], guess = 0.15): number {
  if (cashflows.length < 2) return NaN;
  let hasPos = false;
  let hasNeg = false;
  for (const c of cashflows) {
    if (c > 0) hasPos = true;
    if (c < 0) hasNeg = true;
  }
  if (!hasPos || !hasNeg) return NaN;

  let r = guess;
  for (let iter = 0; iter < 100; iter++) {
    let npv = 0;
    let dnpv = 0;
    for (let t = 0; t < cashflows.length; t++) {
      const denom = Math.pow(1 + r, t);
      npv += cashflows[t] / denom;
      if (t > 0) dnpv += (-t * cashflows[t]) / Math.pow(1 + r, t + 1);
    }
    if (Math.abs(npv) < 1e-7) return r;
    if (dnpv === 0) break;
    const next = r - npv / dnpv;
    if (!isFinite(next)) break;
    if (Math.abs(next - r) < 1e-9) return next;
    r = next;
    if (r < -0.999) r = -0.999;
  }

  // Fallback: bisection across a wide range.
  let lo = -0.95;
  let hi = 10;
  const f = (rate: number) =>
    cashflows.reduce((acc, c, t) => acc + c / Math.pow(1 + rate, t), 0);
  let fl = f(lo);
  let fh = f(hi);
  if (fl * fh > 0) return NaN;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const fm = f(mid);
    if (Math.abs(fm) < 1e-7) return mid;
    if (fm * fl < 0) {
      hi = mid;
      fh = fm;
    } else {
      lo = mid;
      fl = fm;
    }
  }
  return (lo + hi) / 2;
}

export function moic(cashflows: number[]): number {
  let inflow = 0;
  let outflow = 0;
  for (const c of cashflows) {
    if (c > 0) inflow += c;
    else outflow += -c;
  }
  return outflow > 0 ? inflow / outflow : NaN;
}
