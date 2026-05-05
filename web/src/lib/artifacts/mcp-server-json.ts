export interface MCPServerInput {
  name: string
  description?: string
  host: string
  slug: string
  skills?: string[]
}

export function buildMCPServerJson(input: MCPServerInput): Record<string, unknown> {
  return {
    name: input.name,
    description: input.description ?? '',
    url: `https://${input.host}/u/${input.slug}/mcp`,
    version: '1.0.0',
    tools: (input.skills ?? []).map(id => ({
      name: id,
      description: `Skill: ${id}`,
      inputSchema: { type: 'object' },
    })),
  }
}
