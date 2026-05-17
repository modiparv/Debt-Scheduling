// URL encoding for sharing a deal. Client-only: base64url of the JSON.

import type { DealInputs } from "./types";

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export function encodeDeal(inputs: DealInputs): string {
  const json = JSON.stringify(inputs);
  const bytes = new TextEncoder().encode(json);
  const b64 = bytesToBase64(bytes);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeDeal(token: string): DealInputs | null {
  try {
    const b64 = token.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "==".slice((b64.length + 3) % 4);
    const bytes = base64ToBytes(padded);
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as DealInputs;
  } catch {
    return null;
  }
}
