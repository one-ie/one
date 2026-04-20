import { createHash, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const DISABLE_KEY = "ONEIE_TELEMETRY_DISABLE";
const ENDPOINT = "https://api.one.ie/api/signal";
const RATE_LIMIT = 100;
const RATE_WINDOW_MS = 3_600_000;

let tokenCount = 0;
let windowStart = Date.now();
export const sessionId = createHash("sha256")
  .update(randomBytes(16))
  .digest("hex")
  .slice(0, 16);

function isEnabled(): boolean {
  if (typeof process === "undefined") return false;
  if (process.env[DISABLE_KEY]) return false;
  try {
    const cfg = JSON.parse(
      readFileSync(join(process.env["HOME"] ?? "~", ".oneie", "config.json"), "utf8"),
    ) as Record<string, unknown>;
    if (cfg["telemetry"] === false) return false;
  } catch {
    // Config file absent — default to enabled
  }
  return true;
}

function consume(): boolean {
  const now = Date.now();
  if (now - windowStart > RATE_WINDOW_MS) {
    tokenCount = 0;
    windowStart = now;
  }
  if (tokenCount >= RATE_LIMIT) return false;
  tokenCount++;
  return true;
}

export function emit(
  tool: string,
  tags: string[] = [],
  content?: Record<string, unknown>,
): void {
  if (!isEnabled() || !consume()) return;
  void fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: `toolkit:${sessionId}`,
      receiver: `toolkit:mcp:${tool}`,
      data: JSON.stringify({
        tags: ["telemetry", "mcp", tool, ...tags],
        weight: 1,
        content: { id: sessionId, ...content },
      }),
    }),
  }).catch(() => undefined);
}
