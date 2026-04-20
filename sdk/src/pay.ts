// ported from pay-plan.md spec on 2026-04-20
/**
 * SDK pay module — accept, request, status
 *
 * Wraps /api/pay/* endpoints via the SDK fetch layer.
 * Each method emits toolkit:sdk:pay:<method> telemetry.
 */

import { emit } from "./telemetry.js";
import type { SdkConfig } from "./types.js";
import { resolveBaseUrl, resolveApiKey } from "./urls.js";

// ─── Interfaces (per pay-plan.md section 4) ────────────────────────────────

export interface PayAcceptOpts {
  /** Unit uid receiving payment */
  to: string
  /** Payment rail */
  rail: "card" | "crypto" | "weight"
  /** Amount in major currency unit (e.g. 29.99 USD) */
  amount: number
  /** Optional SKU / product ref */
  sku?: string
  /** Sender uid (optional, defaults to "anon") */
  from?: string
  /** Currency code (default "usd") */
  currency?: string
  /** Optional memo / description */
  memo?: string
}

export interface PayAcceptResult {
  linkUrl: string
  qr?: string
  intent?: string
}

export interface PayRequestOpts {
  /** Unit uid requesting payment */
  from: string
  /** Amount in major currency unit */
  amount: number
  /** Payment rail */
  rail: "card" | "crypto" | "weight"
  /** Optional SKU */
  sku?: string
  /** Currency code (default "usd") */
  currency?: string
  /** Optional memo */
  memo?: string
}

export interface PayRequestResult {
  linkUrl: string
  qr?: string
  intent?: string
}

export interface PayStatusResult {
  status: string
  ref: string
  amount?: number
  rail?: string
}

// ─── Internal fetch helper ────────────────────────────────────────────────

async function payFetch<T>(
  baseUrl: string,
  path: string,
  apiKey: string | undefined,
  init: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
  const res = await fetch(`${baseUrl}${path}`, { ...init, headers });
  if (!res.ok) throw new Error(`${init.method ?? "GET"} ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

// ─── Module-level functions (used by SubstrateClient.pay) ────────────────

/**
 * Create an accept payment link.
 * Calls POST /api/pay/create-link with rail, amount, to.
 */
export async function accept(
  opts: PayAcceptOpts,
  cfg: SdkConfig = {},
): Promise<PayAcceptResult> {
  const baseUrl = resolveBaseUrl(cfg.baseUrl);
  const apiKey = resolveApiKey(cfg.apiKey);
  const result = await payFetch<PayAcceptResult>(
    baseUrl,
    "/api/pay/create-link",
    apiKey,
    { method: "POST", body: JSON.stringify(opts) },
  );
  emit("toolkit:sdk:pay:accept", ["sdk", "method-pay", "accept"]);
  return result;
}

/**
 * Create a request-to-pay link (sender perspective).
 * Maps to the same POST /api/pay/create-link with from set.
 */
export async function request(
  opts: PayRequestOpts,
  cfg: SdkConfig = {},
): Promise<PayRequestResult> {
  const baseUrl = resolveBaseUrl(cfg.baseUrl);
  const apiKey = resolveApiKey(cfg.apiKey);
  const result = await payFetch<PayRequestResult>(
    baseUrl,
    "/api/pay/create-link",
    apiKey,
    {
      method: "POST",
      body: JSON.stringify({
        to: opts.from, // request = I want to receive from someone
        rail: opts.rail,
        amount: opts.amount,
        sku: opts.sku,
        currency: opts.currency,
        memo: opts.memo,
      }),
    },
  );
  emit("toolkit:sdk:pay:request", ["sdk", "method-pay", "request"]);
  return result;
}

/**
 * Check the status of a payment by ref.
 * Calls GET /api/pay/status/:ref
 */
export async function status(
  ref: string,
  cfg: SdkConfig = {},
): Promise<PayStatusResult> {
  const baseUrl = resolveBaseUrl(cfg.baseUrl);
  const apiKey = resolveApiKey(cfg.apiKey);
  const result = await payFetch<PayStatusResult>(
    baseUrl,
    `/api/pay/status/${encodeURIComponent(ref)}`,
    apiKey,
  );
  emit("toolkit:sdk:pay:status", ["sdk", "method-pay", "status"]);
  return result;
}
