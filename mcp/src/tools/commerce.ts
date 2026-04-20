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

export function commerceTools(): McpTool[] {
  return [
    {
      name: "claw",
      description: "Deploy a NanoClaw edge worker for an agent persona.",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string" },
          persona: { type: "string" },
          telegramToken: { type: "string" },
          openrouterKey: { type: "string" },
        },
        required: ["name"],
      },
      handler: async (args, env) =>
        apiCall(env.baseUrl, env.apiKey, "/api/claw", {
          method: "POST",
          body: JSON.stringify({
            name: args.name,
            persona: args.persona,
            telegramToken: args.telegramToken,
            openrouterKey: args.openrouterKey,
          }),
        }),
    },
    {
      name: "commend",
      description: "Commend an agent; boosts success-rate and strengthens outgoing paths.",
      inputSchema: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
      handler: async (args, env) =>
        apiCall(env.baseUrl, env.apiKey, `/api/agents/${args.id}/commend`, {
          method: "POST",
          body: JSON.stringify({}),
        }),
    },
    {
      name: "flag",
      description: "Flag an agent; lowers success-rate and adds resistance to outgoing paths.",
      inputSchema: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
      handler: async (args, env) =>
        apiCall(env.baseUrl, env.apiKey, `/api/agents/${args.id}/flag`, {
          method: "POST",
          body: JSON.stringify({}),
        }),
    },
    {
      name: "status",
      description: "Set an agent's lifecycle status to active or inactive.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string" },
          status: { type: "string", enum: ["active", "inactive"] },
        },
        required: ["id", "status"],
      },
      handler: async (args, env) =>
        apiCall(env.baseUrl, env.apiKey, `/api/agents/${args.id}/status`, {
          method: "POST",
          body: JSON.stringify({ status: args.status }),
        }),
    },
    {
      name: "capabilities_add",
      description: "Add a skill capability to an agent with an optional price.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string" },
          taskName: { type: "string" },
          taskType: { type: "string" },
          price: { type: "number" },
          currency: { type: "string" },
        },
        required: ["id", "taskName"],
      },
      handler: async (args, env) =>
        apiCall(env.baseUrl, env.apiKey, `/api/agents/${args.id}/capabilities`, {
          method: "POST",
          body: JSON.stringify({
            taskName: args.taskName,
            taskType: args.taskType,
            price: args.price,
            currency: args.currency,
          }),
        }),
    },
    {
      name: "capabilities_publish",
      description: "Publish a skill to the marketplace with price, scope, and rubric thresholds.",
      inputSchema: {
        type: "object",
        properties: {
          skillId: { type: "string" },
          name: { type: "string" },
          price: { type: "number" },
          scope: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          rubricThresholds: {
            type: "object",
            properties: {
              fit: { type: "number" },
              form: { type: "number" },
              truth: { type: "number" },
              taste: { type: "number" },
            },
          },
        },
        required: ["skillId", "name", "price"],
      },
      handler: async (args, env) =>
        apiCall(env.baseUrl, env.apiKey, "/api/capabilities/publish", {
          method: "POST",
          body: JSON.stringify({
            skillId: args.skillId,
            name: args.name,
            price: args.price,
            scope: args.scope,
            tags: args.tags,
            rubricThresholds: args.rubricThresholds,
          }),
        }),
    },
    {
      name: "hire",
      description: "Hire an agent for a skill; creates a group and returns the chat URL.",
      inputSchema: {
        type: "object",
        properties: {
          providerUid: { type: "string" },
          skillId: { type: "string" },
          initialMessage: { type: "string" },
        },
        required: ["providerUid", "skillId"],
      },
      handler: async (args, env) =>
        apiCall(env.baseUrl, env.apiKey, "/api/buy/hire", {
          method: "POST",
          body: JSON.stringify({
            providerUid: args.providerUid,
            skillId: args.skillId,
            initialMessage: args.initialMessage,
          }),
        }),
    },
    {
      name: "bounty",
      description: "Post a bounty for a skill with price, deadline, and rubric thresholds.",
      inputSchema: {
        type: "object",
        properties: {
          providerUid: { type: "string" },
          skillId: { type: "string" },
          price: { type: "number" },
          deadlineMs: { type: "number" },
          rubricThresholds: {
            type: "object",
            properties: {
              fit: { type: "number" },
              form: { type: "number" },
              truth: { type: "number" },
              taste: { type: "number" },
            },
            required: ["fit", "form", "truth", "taste"],
          },
          tags: { type: "array", items: { type: "string" } },
          description: { type: "string" },
        },
        required: ["providerUid", "skillId", "price", "deadlineMs", "rubricThresholds"],
      },
      handler: async (args, env) =>
        apiCall(env.baseUrl, env.apiKey, "/api/buy/bounty", {
          method: "POST",
          body: JSON.stringify({
            providerUid: args.providerUid,
            skillId: args.skillId,
            price: args.price,
            deadlineMs: args.deadlineMs,
            rubricThresholds: args.rubricThresholds,
            tags: args.tags,
            description: args.description,
          }),
        }),
    },
    {
      name: "escrow_create",
      description: "Create a Sui on-chain escrow for a task between two units.",
      inputSchema: {
        type: "object",
        properties: {
          posterUid: { type: "string" },
          workerUnitObjectId: { type: "string" },
          taskName: { type: "string" },
          amountMist: { type: "number" },
          deadlineMs: { type: "number" },
          pathObjectId: { type: "string" },
        },
        required: ["posterUid", "workerUnitObjectId", "taskName", "amountMist", "deadlineMs", "pathObjectId"],
      },
      handler: async (args, env) =>
        apiCall(env.baseUrl, env.apiKey, "/api/escrow/create", {
          method: "POST",
          body: JSON.stringify({
            posterUid: args.posterUid,
            workerUnitObjectId: args.workerUnitObjectId,
            taskName: args.taskName,
            amountMist: args.amountMist,
            deadlineMs: args.deadlineMs,
            pathObjectId: args.pathObjectId,
          }),
        }),
    },
    {
      name: "harden",
      description: "Harden a strong path on-chain; promotes it to a permanent Sui highway.",
      inputSchema: {
        type: "object",
        properties: {
          uid: { type: "string" },
          from: { type: "string" },
          to: { type: "string" },
        },
        required: ["uid", "from", "to"],
      },
      handler: async (args, env) =>
        apiCall(env.baseUrl, env.apiKey, "/api/harden", {
          method: "POST",
          body: JSON.stringify({ uid: args.uid, from: args.from, to: args.to }),
        }),
    },
    // ── Pay tools (ported from pay-plan.md section 5 on 2026-04-20) ──────────
    {
      name: "pay_create_link",
      description: "Create a payment link for a unit on any rail (card, crypto, or weight). Returns a linkUrl and optional QR code URL.",
      inputSchema: {
        type: "object",
        properties: {
          to: { type: "string", description: "Recipient unit uid" },
          rail: { type: "string", enum: ["card", "crypto", "weight"], description: "Payment rail" },
          amount: { type: "number", description: "Amount in major currency unit (e.g. 29.99)" },
          sku: { type: "string", description: "Optional product SKU or task ref" },
          from: { type: "string", description: "Sender uid (optional)" },
          currency: { type: "string", description: "Currency code (default usd)" },
          memo: { type: "string", description: "Optional memo / description" },
        },
        required: ["to", "rail", "amount"],
      },
      handler: async (args, env) =>
        apiCall(env.baseUrl, env.apiKey, "/api/pay/create-link", {
          method: "POST",
          body: JSON.stringify({
            to: args.to,
            rail: args.rail,
            amount: args.amount,
            sku: args.sku,
            from: args.from,
            currency: args.currency,
            memo: args.memo,
          }),
        }),
    },
    {
      name: "pay_check_status",
      description: "Check the status of a payment by ref (pi_ for Stripe, 0x for Sui digest, sl_ for pay.one.ie shortlink).",
      inputSchema: {
        type: "object",
        properties: {
          ref: { type: "string", description: "Payment ref (pi_..., 0x..., or sl_...)" },
        },
        required: ["ref"],
      },
      handler: async (args, env) =>
        apiCall(env.baseUrl, env.apiKey, `/api/pay/status/${encodeURIComponent(args.ref as string)}`),
    },
    {
      name: "pay_cancel",
      description: "Cancel a pending payment by ref. Only supported for Stripe PaymentIntents (pi_ prefix).",
      inputSchema: {
        type: "object",
        properties: {
          ref: { type: "string", description: "Stripe PaymentIntent id (pi_...)" },
        },
        required: ["ref"],
      },
      handler: async (args, env) =>
        apiCall(env.baseUrl, env.apiKey, `/api/pay/status/${encodeURIComponent(args.ref as string)}`, {
          method: "DELETE",
        }),
    },
  ];
}
