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

export function substrateTools(): McpTool[] {
  return [
    {
      name: "signal",
      description: "Emit a signal into the substrate.",
      inputSchema: { type: "object", properties: { receiver: { type: "string" }, data: {}, sender: { type: "string" } }, required: ["receiver"] },
      handler: async (args, env) =>
        apiCall(env.baseUrl, env.apiKey, "/api/signal", {
          method: "POST",
          body: JSON.stringify({ sender: args.sender ?? "mcp", receiver: args.receiver, data: args.data }),
        }),
    },
    {
      name: "ask",
      description: "Signal + wait for outcome (result | timeout | dissolved | failure).",
      inputSchema: { type: "object", properties: { receiver: { type: "string" }, data: {}, timeout: { type: "number" } }, required: ["receiver"] },
      handler: async (args, env) =>
        apiCall(env.baseUrl, env.apiKey, "/api/ask", {
          method: "POST",
          body: JSON.stringify({ receiver: args.receiver, data: args.data, timeout: args.timeout, from: "mcp" }),
        }),
    },
    {
      name: "mark",
      description: "Strengthen a path.",
      inputSchema: { type: "object", properties: { edge: { type: "string" }, strength: { type: "number" } }, required: ["edge"] },
      handler: async (args, env) =>
        apiCall(env.baseUrl, env.apiKey, "/api/loop/mark-dims", {
          method: "POST",
          body: JSON.stringify({ edge: args.edge, strength: args.strength ?? 1, source: "mcp" }),
        }),
    },
    {
      name: "warn",
      description: "Raise resistance on a path.",
      inputSchema: { type: "object", properties: { edge: { type: "string" }, strength: { type: "number" } }, required: ["edge"] },
      handler: async (args, env) =>
        apiCall(env.baseUrl, env.apiKey, "/api/loop/mark-dims", {
          method: "POST",
          body: JSON.stringify({ edge: args.edge, strength: -Math.abs((args.strength as number) ?? 1), source: "mcp" }),
        }),
    },
    {
      name: "fade",
      description: "Asymmetric decay of all paths.",
      inputSchema: { type: "object", properties: { rate: { type: "number" } } },
      handler: async (args, env) =>
        apiCall(env.baseUrl, env.apiKey, `/api/decay-cycle?rate=${args.rate ?? 0.05}`, { method: "POST" }),
    },
    {
      name: "select",
      description: "Probabilistic path selection (pheromone-weighted).",
      inputSchema: { type: "object", properties: { type: { type: "string" }, sensitivity: { type: "number" } } },
      handler: async (args, env) => {
        const q = new URLSearchParams();
        if (args.type) q.set("type", String(args.type));
        q.set("sensitivity", String(args.sensitivity ?? 0.5));
        return apiCall(env.baseUrl, env.apiKey, `/api/loop/stage?${q}`);
      },
    },
    {
      name: "recall",
      description: "Query hypotheses from the brain.",
      inputSchema: { type: "object", properties: { subject: { type: "string" } } },
      handler: async (args, env) => {
        const p = args.subject
          ? `/api/hypotheses?subject=${encodeURIComponent(String(args.subject))}`
          : "/api/hypotheses";
        return apiCall(env.baseUrl, env.apiKey, p);
      },
    },
    {
      name: "reveal",
      description: "Full memory card for a uid.",
      inputSchema: { type: "object", properties: { uid: { type: "string" } }, required: ["uid"] },
      handler: async (args, env) =>
        apiCall(env.baseUrl, env.apiKey, `/api/memory/reveal/${encodeURIComponent(String(args.uid))}`),
    },
    {
      name: "forget",
      description: "GDPR erasure of a uid.",
      inputSchema: { type: "object", properties: { uid: { type: "string" } }, required: ["uid"] },
      handler: async (args, env) =>
        apiCall(env.baseUrl, env.apiKey, `/api/memory/forget/${encodeURIComponent(String(args.uid))}`, { method: "DELETE" }),
    },
    {
      name: "frontier",
      description: "Unexplored tag clusters for a uid.",
      inputSchema: { type: "object", properties: { uid: { type: "string" } }, required: ["uid"] },
      handler: async (args, env) =>
        apiCall(env.baseUrl, env.apiKey, `/api/memory/frontier/${encodeURIComponent(String(args.uid))}`),
    },
    {
      name: "know",
      description: "Promote highways to hypotheses (L6 learning).",
      inputSchema: { type: "object", properties: {} },
      handler: async (_args, env) =>
        apiCall(env.baseUrl, env.apiKey, "/api/tick?loops=L6", { method: "POST" }).catch(() =>
          apiCall(env.baseUrl, env.apiKey, "/api/hypotheses"),
        ),
    },
    {
      name: "highways",
      description: "Top weighted paths (proven routes).",
      inputSchema: { type: "object", properties: { limit: { type: "number" } } },
      handler: async (args, env) =>
        apiCall(env.baseUrl, env.apiKey, `/api/loop/highways?limit=${args.limit ?? 20}`).catch(() =>
          apiCall(env.baseUrl, env.apiKey, `/api/export/highways?limit=${args.limit ?? 20}`),
        ),
    },
  ];
}
