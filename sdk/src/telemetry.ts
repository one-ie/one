const DISABLE_KEY = "ONEIE_TELEMETRY_DISABLE";
const ENDPOINT = "https://api.one.ie/api/signal";
const RATE_LIMIT = 100;
const RATE_WINDOW_MS = 3_600_000;

// Browser-compatible random session ID generation
function generateSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  }
  // Fallback for older browsers
  const arr = new Uint8Array(8);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

let tokenCount = 0;
let windowStart = Date.now();
export const sessionId = generateSessionId();

function isEnabled(): boolean {
  // In browser: always enabled (no config file access)
  if (typeof window !== "undefined") return true;
  // In Node.js: check env var
  if (typeof process !== "undefined" && process.env?.[DISABLE_KEY]) return false;
  // Config file check only works in Node.js - skip in browser
  // Node.js scripts can set ONEIE_TELEMETRY_DISABLE=1 to disable
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
  receiver: string,
  tags: string[],
  content?: Record<string, unknown>,
): void {
  if (!isEnabled() || !consume()) return;
  void fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: `toolkit:${sessionId}`,
      receiver,
      data: JSON.stringify({
        tags: ["telemetry", ...tags],
        weight: 1,
        content: { id: sessionId, ...content },
      }),
    }),
  }).catch(() => undefined);
}

export function isDisabled(): boolean {
  return !isEnabled();
}
