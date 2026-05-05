export interface AgentCardInput {
  name: string
  summary?: string
  description?: string
  skills?: string[]
  host: string
  slug: string
}

export function buildAgentCard(input: AgentCardInput): Record<string, unknown> {
  return {
    schemaVersion: '1.0',
    name: input.name,
    description: input.description ?? input.summary ?? '',
    url: `https://${input.host}/u/${input.slug}/`,
    version: '1.0.0',
    capabilities: { streaming: true, pushNotifications: false, stateTransitionHistory: false },
    defaultInputModes: ['text/plain'],
    defaultOutputModes: ['text/plain'],
    skills: (input.skills ?? []).map(id => ({
      id,
      name: id,
      description: '',
      tags: [] as string[],
      examples: [] as string[],
    })),
  }
}
