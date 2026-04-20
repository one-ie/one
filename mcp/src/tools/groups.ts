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

export function groupTools(): McpTool[] {
  return [
    {
      name: "group_create",
      description: "Create a new group (org, team, world, community, dao, friends, personal). Caller becomes chairman.",
      inputSchema: {
        type: "object",
        properties: {
          gid: { type: "string", description: "Unique group identifier" },
          name: { type: "string", description: "Display name" },
          groupType: { type: "string", enum: ["world", "org", "team", "community", "dao", "friends", "personal"], description: "Group shape" },
          visibility: { type: "string", enum: ["public", "private", "unlisted"], description: "Who can discover this group" },
        },
        required: ["gid", "name"],
      },
      handler: async (args, env) =>
        apiCall(env.baseUrl, env.apiKey, "/api/groups", {
          method: "POST",
          body: JSON.stringify({ gid: args.gid, name: args.name, groupType: args.groupType, visibility: args.visibility }),
        }),
    },
    {
      name: "group_list",
      description: "List groups the caller is a member of, plus public groups.",
      inputSchema: {
        type: "object",
        properties: {},
      },
      handler: async (_args, env) =>
        apiCall(env.baseUrl, env.apiKey, "/api/groups"),
    },
    {
      name: "group_join",
      description: "Join a public group. Returns 403 for private groups (use invite flow).",
      inputSchema: {
        type: "object",
        properties: {
          gid: { type: "string", description: "Group identifier to join" },
        },
        required: ["gid"],
      },
      handler: async (args, env) =>
        apiCall(env.baseUrl, env.apiKey, "/api/groups/join", {
          method: "POST",
          body: JSON.stringify({ gid: args.gid }),
        }),
    },
    {
      name: "group_invite",
      description: "Invite a unit into a group with a specific role. Requires invite_member permission.",
      inputSchema: {
        type: "object",
        properties: {
          gid: { type: "string", description: "Group identifier" },
          uid: { type: "string", description: "Unit to invite" },
          role: { type: "string", enum: ["chairman", "ceo", "board", "operator", "agent", "auditor", "member"], description: "Role to assign" },
        },
        required: ["gid", "uid"],
      },
      handler: async (args, env) =>
        apiCall(env.baseUrl, env.apiKey, `/api/groups/${encodeURIComponent(String(args.gid))}/invite`, {
          method: "POST",
          body: JSON.stringify({ uid: args.uid, role: args.role }),
        }),
    },
    {
      name: "group_bridge",
      description: "Initiate or complete a federation bridge between two groups. First call → 202 pending. Second call (from the other group) → 201 bridged.",
      inputSchema: {
        type: "object",
        properties: {
          from: { type: "string", description: "Initiating group gid" },
          to: { type: "string", description: "Target group gid" },
        },
        required: ["from", "to"],
      },
      handler: async (args, env) =>
        apiCall(env.baseUrl, env.apiKey, "/api/paths/bridge", {
          method: "POST",
          body: JSON.stringify({ from: args.from, to: args.to }),
        }),
    },
  ];
}
