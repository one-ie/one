#!/usr/bin/env node
import { createRouter, serve } from "./serve.js";
import { substrateTools } from "./tools/substrate.js";
import { discoveryTools } from "./tools/discovery.js";
import { lifecycleTools } from "./tools/lifecycle.js";
import { commerceTools } from "./tools/commerce.js";
import { observabilityTools } from "./tools/observability.js";
import { groupTools } from "./tools/groups.js";

export { createRouter, serve } from "./serve.js";
export { readEnv } from "./env.js";
export type { McpTool, McpRouter } from "./serve.js";
export { substrateTools } from "./tools/substrate.js";
export { discoveryTools } from "./tools/discovery.js";
export { lifecycleTools } from "./tools/lifecycle.js";
export { commerceTools } from "./tools/commerce.js";
export { observabilityTools } from "./tools/observability.js";
export { groupTools } from "./tools/groups.js";

export const MCP_VERSION = "0.3.0";
export const MCP_TOOLS = {
  substrate: ["signal", "ask", "mark", "warn", "fade", "select", "recall", "reveal", "forget", "frontier", "know", "highways"] as const,
  lifecycle: ["auth_agent", "sync_agent", "discover_skill", "register", "pay"] as const,
  commerce: ["claw", "commend", "flag", "status", "capabilities_add", "capabilities_publish", "hire", "bounty", "escrow_create", "harden"] as const,
  observability: ["stats", "health", "revenue", "frontiers_global", "hypotheses_global", "export_units", "export_highways", "intent_learn", "ingest_event", "chat_turn"] as const,
  discovery: ["scaffold_agent", "list_agents", "get_agent"] as const,
  groups: ["group_create", "group_list", "group_join", "group_invite", "group_bridge"] as const,
};

export function createOneRouter() {
  const router = createRouter();
  for (const tool of [...substrateTools(), ...lifecycleTools(), ...commerceTools(), ...observabilityTools(), ...discoveryTools(), ...groupTools()]) {
    router.register(tool);
  }
  return router;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const router = createOneRouter();
  serve(router, { name: "oneie", version: MCP_VERSION }).catch((err) => {
    process.stderr.write(`oneie-mcp: ${err}\n`);
    process.exit(1);
  });
}
