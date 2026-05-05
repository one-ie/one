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

import { readFileSync } from 'node:fs'

interface AgentFrontmatter {
  name?: string
  title?: string
  summary?: string
  skills?: string[]
}

function parseFrontmatter(md: string): AgentFrontmatter {
  const m = md.match(/^---\s*\n([\s\S]*?)\n---/)
  if (!m) return {}
  const meta: AgentFrontmatter = {}
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':')
    if (i < 0) continue
    const k = line.slice(0, i).trim() as keyof AgentFrontmatter
    const v = line.slice(i + 1).trim().replace(/^["']|["']$/g, '')
    if (k === 'skills') {
      meta.skills = v.replace(/[\[\]]/g, '').split(',').map(s => s.trim()).filter(Boolean)
    } else {
      (meta as Record<string, string>)[k] = v
    }
  }
  return meta
}

export async function serveMd(
  agentPath: string,
  opts?: { name?: string; version?: string },
): Promise<void> {
  const md = readFileSync(agentPath, 'utf8')
  const meta = parseFrontmatter(md)
  const router = createRouter()

  router.register({
    name: 'activate_skill',
    description: 'Activate a skill by name with structured input',
    inputSchema: {
      type: 'object',
      required: ['skill', 'input'],
      properties: {
        skill: { type: 'string', description: 'Skill name from the agent\'s skills list' },
        input: { type: 'object', description: 'Skill input matching the skill\'s inputSchema' },
      },
    },
    handler: async (args: Record<string, unknown>) => ({
      skill: args.skill,
      input: args.input,
      result: `Skill '${String(args.skill)}' activated — connect to substrate for execution`,
      resources: (meta.skills ?? []).map(s => ({ uri: `skill://${s}`, name: s })),
    }),
  })

  for (const skillName of meta.skills ?? []) {
    router.register({
      name: skillName,
      description: `Skill: ${skillName}`,
      inputSchema: { type: 'object' },
      handler: async (args: Record<string, unknown>) => ({ skill: skillName, args, status: 'dispatched' }),
    })
  }

  await serve(router, { name: opts?.name ?? meta.name ?? 'oneie-agent', version: opts?.version })
}
