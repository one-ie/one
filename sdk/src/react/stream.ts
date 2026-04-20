import type { SubstrateClient } from "../client.js";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface StreamChatOpts {
  model?: string;
  tags?: string[];
  system?: string;
  agentId?: string;
  apiKey?: string;
}

async function* parseSSE(body: ReadableStream<Uint8Array>): AsyncIterable<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6).trim();
        if (data === "[DONE]") return;
        if (data) yield data;
      }
    }
  }
}

export async function* streamChat(
  client: SubstrateClient,
  messages: ChatMessage[],
  opts: StreamChatOpts = {},
): AsyncIterable<string> {
  const baseUrl = (client as unknown as { baseUrl: string }).baseUrl;
  const apiKey = (client as unknown as { apiKey?: string }).apiKey;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({ messages, ...opts }),
  });

  if (!res.ok || !res.body) return;
  yield* parseSSE(res.body);
}

export async function* streamTail(
  client: SubstrateClient,
  opts: { interval?: number; reload?: boolean } = {},
): AsyncIterable<unknown> {
  const baseUrl = (client as unknown as { baseUrl: string }).baseUrl;
  const apiKey = (client as unknown as { apiKey?: string }).apiKey;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

  const qs = [
    opts.interval != null ? `interval=${opts.interval}` : null,
    opts.reload ? "reload=1" : null,
  ].filter(Boolean).join("&");

  const res = await fetch(`${baseUrl}/api/stream${qs ? `?${qs}` : ""}`, { headers });
  if (!res.ok || !res.body) return;

  for await (const line of parseSSE(res.body)) {
    try { yield JSON.parse(line); } catch { yield line; }
  }
}
