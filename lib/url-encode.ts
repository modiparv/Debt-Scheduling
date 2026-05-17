// URL encoding for sharing a deal. Client-only: base64url of the JSON.

import type { DealInputs } from "./types.ts";

export function encodeDeal(inputs: DealInputs): string {
  const json = JSON.stringify(inputs);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeDeal(token: string): DealInputs | null {
  try {
    const b64 = token.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "==".slice((b64.length + 3) % 4);
    const json = decodeURIComponent(escape(atob(padded)));
    return JSON.parse(json) as DealInputs;
  } catch {
    return null;
  }
}
