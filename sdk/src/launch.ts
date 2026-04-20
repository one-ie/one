import { resolveApiKey, resolveBaseUrl } from "./urls.js";
import { OneSdkError } from "./types.js";

export interface LaunchOpts {
  agentLaunchUrl?: string;
  apiKey?: string;
  dryRun?: boolean;
  chain?: "sui" | "base" | "solana";
  meta?: Record<string, unknown>;
}

export interface LaunchResult {
  tokenId: string;
  address?: string;
  chain: string;
  dryRun: boolean;
  raw: unknown;
}

const DEFAULT_AGENT_LAUNCH_URL = "https://agent-launch.ai/api";

export async function launchToken(agentUid: string, opts: LaunchOpts = {}): Promise<LaunchResult> {
  const base = opts.agentLaunchUrl ?? process.env.AGENT_LAUNCH_URL ?? DEFAULT_AGENT_LAUNCH_URL;
  const key = resolveApiKey(opts.apiKey);
  const body = {
    agentUid,
    chain: opts.chain ?? "sui",
    dryRun: opts.dryRun ?? false,
    meta: opts.meta ?? {},
  };
  const headers = new Headers({ "Content-Type": "application/json" });
  if (key) headers.set("Authorization", `Bearer ${key}`);
  const res = await fetch(`${base.replace(/\/$/, "")}/v1/tokens`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new OneSdkError(`launch ${res.status}`, res.status);
  const raw = (await res.json()) as Record<string, unknown>;
  const tokenId = String(raw.tokenId ?? raw.id ?? `dry-${Date.now()}`);
  const result: LaunchResult = {
    tokenId,
    address: typeof raw.address === "string" ? raw.address : undefined,
    chain: body.chain,
    dryRun: body.dryRun,
    raw,
  };
  // Emit token-launched signal to the substrate (best-effort).
  try {
    await fetch(`${resolveBaseUrl(undefined)}/api/signal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receiver: `agent:${agentUid}`,
        data: { tags: ["token-launched"], content: result },
        scope: "public",
      }),
    });
  } catch {
    // signal emit is best-effort; the launch itself is authoritative
  }
  return result;
}
