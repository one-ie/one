import type { McpTool } from "../serve.js";

async function apiCall(baseUrl: string, apiKey: string | undefined, path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (apiKey) headers.set("Authorization", `Bearer ${apiKey}`);
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, { ...init, headers });
  if (!res.ok) throw new Error(`${init.method ?? "GET"} ${path} → ${res.status}`);
  if (res.status === 204) return null;
  const ct = res.headers.get("content-type") ?? "";
  return ct.includes("json") ? res.json() : res.text();
}

export function observabilityTools(): McpTool[] {
  return [
    {
      name: "stats",
      description: "Return aggregate substrate stats: unit counts, highways, and revenue totals.",
      inputSchema: { type: "object", properties: {} },
      handler: async (_args, env) => apiCall(env.baseUrl, env.apiKey, "/api/stats"),
    },
    {
      name: "health",
      description: "Return substrate health: world state, unit count, revenue, and top group.",
      inputSchema: { type: "object", properties: {} },
      handler: async (_args, env) => apiCall(env.baseUrl, env.apiKey, "/api/health"),
    },
    {
      name: "revenue",
      description: "Return revenue breakdown: GDP, total transactions, and top earners by unit.",
      inputSchema: { type: "object", properties: {} },
      handler: async (_args, env) => apiCall(env.baseUrl, env.apiKey, "/api/revenue"),
    },
    {
      name: "frontiers_global",
      description: "Return unexplored frontier hypotheses with expected value >= 0.5.",
      inputSchema: { type: "object", properties: {} },
      handler: async (_args, env) => apiCall(env.baseUrl, env.apiKey, "/api/frontiers"),
    },
    {
      name: "hypotheses_global",
      description: "Query all hypotheses; optionally filter by status (pending|testing|confirmed|rejected).",
      inputSchema: {
        type: "object",
        properties: { status: { type: "string", enum: ["pending", "testing", "confirmed", "rejected"] } },
      },
      handler: async (args, env) => {
        const p = new URLSearchParams();
        if (args.status) p.set("status", String(args.status));
        const qs = p.toString() ? `?${p}` : "";
        return apiCall(env.baseUrl, env.apiKey, `/api/hypotheses${qs}`);
      },
    },
    {
      name: "export_units",
      description: "Export all units as a JSON snapshot (uid, name, kind, successRate, generation).",
      inputSchema: { type: "object", properties: {} },
      handler: async (_args, env) => apiCall(env.baseUrl, env.apiKey, "/api/export/units"),
    },
    {
      name: "export_highways",
      description: "Export top weighted paths (strength >= 20) with optional context hints.",
      inputSchema: {
        type: "object",
        properties: {
          limit: { type: "number" },
          includeContext: { type: "boolean" },
        },
      },
      handler: async (args, env) => {
        const p = new URLSearchParams();
        if (args.limit) p.set("limit", String(args.limit));
        if (args.includeContext) p.set("context", "1");
        const qs = p.toString() ? `?${p}` : "";
        return apiCall(env.baseUrl, env.apiKey, `/api/export/highways${qs}`);
      },
    },
    {
      name: "intent_learn",
      description: "Return unrecognized queries ranked by frequency to discover new intent patterns.",
      inputSchema: {
        type: "object",
        properties: {
          limit: { type: "number" },
          minFrequency: { type: "number" },
        },
      },
      handler: async (args, env) => {
        const p = new URLSearchParams();
        if (args.limit) p.set("limit", String(args.limit));
        if (args.minFrequency) p.set("minFrequency", String(args.minFrequency));
        const qs = p.toString() ? `?${p}` : "";
        return apiCall(env.baseUrl, env.apiKey, `/api/intents/learn${qs}`);
      },
    },
    {
      name: "ingest_event",
      description: "Ingest a pheromone event (kind: email|stripe|rating|analytics) into the substrate.",
      inputSchema: {
        type: "object",
        properties: {
          kind: { type: "string", enum: ["email", "stripe", "rating", "analytics"] },
          event: { type: "object" },
        },
        required: ["kind", "event"],
      },
      handler: async (args, env) =>
        apiCall(env.baseUrl, env.apiKey, `/api/ingest/${args.kind}`, {
          method: "POST",
          body: JSON.stringify({ event: args.event }),
        }),
    },
    {
      name: "chat_turn",
      description: "Send a chat turn to the substrate LLM; returns streamed text and next-turn tags.",
      inputSchema: {
        type: "object",
        properties: {
          messages: {
            type: "array",
            items: {
              type: "object",
              properties: { role: { type: "string" }, content: { type: "string" } },
              required: ["role", "content"],
            },
          },
          model: { type: "string" },
          actorUid: { type: "string" },
          lastTags: { type: "array", items: { type: "string" } },
        },
        required: ["messages"],
      },
      handler: async (args, env) => {
        const headers = new Headers();
        headers.set("Content-Type", "application/json");
        if (env.apiKey) headers.set("Authorization", `Bearer ${env.apiKey}`);
        const res = await fetch(`${env.baseUrl.replace(/\/$/, "")}/api/chat/turn`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            messages: args.messages,
            model: args.model,
            actorUid: args.actorUid,
            lastTags: args.lastTags,
          }),
        });
        if (!res.ok) throw new Error(`POST /api/chat/turn → ${res.status}`);
        const raw = await res.text();
        const nextTags = res.headers.get("X-Turn-Tags") ?? "";
        const content = raw
          .split("\n")
          .filter((l) => l.startsWith("0:"))
          .map((l) => { try { return JSON.parse(l.slice(2)); } catch { return ""; } })
          .join("");
        return { content: content || raw, nextTags: nextTags ? nextTags.split(",") : [] };
      },
    },
  ];
}
