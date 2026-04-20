import type { McpTool } from "../serve.js";

export function discoveryTools(): McpTool[] {
  return [
    {
      name: "scaffold_agent",
      description: "Scaffold an agent markdown file from a preset.",
      inputSchema: {
        type: "object",
        properties: { preset: { type: "string" }, name: { type: "string" }, group: { type: "string" } },
        required: ["preset", "name"],
      },
      handler: async (args) => {
        const tpl = await import("@oneie/templates");
        const preset = tpl.getPreset(String(args.preset));
        if (!preset) throw new Error(`unknown preset: ${args.preset}`);
        return tpl.generate({ name: String(args.name), preset, group: args.group as string | undefined });
      },
    },
    {
      name: "list_agents",
      description: "List all registered templates/presets.",
      inputSchema: { type: "object", properties: {} },
      handler: async () => {
        const tpl = await import("@oneie/templates");
        return tpl.listPresets();
      },
    },
    {
      name: "get_agent",
      description: "Get a preset by name.",
      inputSchema: { type: "object", properties: { name: { type: "string" } }, required: ["name"] },
      handler: async (args) => {
        const tpl = await import("@oneie/templates");
        return tpl.getPreset(String(args.name)) ?? null;
      },
    },
  ];
}
