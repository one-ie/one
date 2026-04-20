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

export function lifecycleTools(): McpTool[] {
  return [
    {
      name: "auth_agent",
      description: "Register or re-authenticate an agent; returns uid, wallet, and a one-time API key.",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string" },
          uid: { type: "string" },
          kind: { type: "string" },
        },
      },
      handler: async (args, env) =>
        apiCall(env.baseUrl, env.apiKey, "/api/auth/agent", {
          method: "POST",
          body: JSON.stringify({ name: args.name, uid: args.uid, kind: args.kind }),
        }),
    },
    {
      name: "sync_agent",
      description: "Sync an agent markdown spec to TypeDB; creates unit, skills, and capabilities.",
      inputSchema: {
        type: "object",
        properties: {
          markdown: { type: "string" },
          world: { type: "string" },
          description: { type: "string" },
        },
        required: ["markdown"],
      },
      handler: async (args, env) =>
        apiCall(env.baseUrl, env.apiKey, "/api/agents/sync", {
          method: "POST",
          body: JSON.stringify({ markdown: args.markdown, world: args.world, description: args.description }),
        }),
    },
    {
      name: "discover_skill",
      description: "Find agents that offer a named skill, ranked by pheromone strength.",
      inputSchema: {
        type: "object",
        properties: {
          skill: { type: "string" },
          limit: { type: "number" },
        },
        required: ["skill"],
      },
      handler: async (args, env) => {
        const p = new URLSearchParams({ skill: String(args.skill) });
        if (args.limit) p.set("limit", String(args.limit));
        return apiCall(env.baseUrl, env.apiKey, `/api/agents/discover?${p}`);
      },
    },
    {
      name: "register",
      description: "Register a unit with capabilities and optionally link a Sui wallet.",
      inputSchema: {
        type: "object",
        properties: {
          uid: { type: "string" },
          kind: { type: "string" },
          capabilities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill: { type: "string" },
                price: { type: "number" },
              },
              required: ["skill"],
            },
          },
          wallet: { type: "string" },
          chain: { type: "string" },
        },
        required: ["uid"],
      },
      handler: async (args, env) =>
        apiCall(env.baseUrl, env.apiKey, "/api/agents/register", {
          method: "POST",
          body: JSON.stringify({
            uid: args.uid,
            kind: args.kind,
            capabilities: args.capabilities,
            wallet: args.wallet,
            chain: args.chain,
          }),
        }),
    },
    {
      name: "pay",
      description: "Record a payment between units; deposits pheromone proportional to amount.",
      inputSchema: {
        type: "object",
        properties: {
          from: { type: "string" },
          to: { type: "string" },
          task: { type: "string" },
          amount: { type: "number" },
        },
        required: ["from", "to", "task", "amount"],
      },
      handler: async (args, env) =>
        apiCall(env.baseUrl, env.apiKey, "/api/pay", {
          method: "POST",
          body: JSON.stringify({ from: args.from, to: args.to, task: args.task, amount: args.amount }),
        }),
    },
  ];
}
