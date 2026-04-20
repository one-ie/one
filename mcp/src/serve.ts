import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readEnv } from "./env.js";

export interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, unknown>, env: ReturnType<typeof readEnv>) => Promise<unknown>;
}

export interface McpRouter {
  tools: Map<string, McpTool>;
  register(tool: McpTool): void;
  call(name: string, args: Record<string, unknown>): Promise<unknown>;
}

export function createRouter(): McpRouter {
  const tools = new Map<string, McpTool>();
  const env = readEnv();
  return {
    tools,
    register(tool) {
      tools.set(tool.name, tool);
    },
    async call(name, args) {
      const tool = tools.get(name);
      if (!tool) throw new Error(`unknown tool: ${name}`);
      return tool.handler(args ?? {}, env);
    },
  };
}

/** Start an MCP stdio server backed by the given router. */
export async function serve(router: McpRouter, opts?: { name?: string; version?: string }): Promise<void> {
  const server = new Server(
    { name: opts?.name ?? "oneie", version: opts?.version ?? "0.1.0" },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: Array.from(router.tools.values()).map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: args } = req.params;
    try {
      const result = await router.call(name, (args as Record<string, unknown>) ?? {});
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    } catch (err) {
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ error: String(err) }) }],
        isError: true,
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
