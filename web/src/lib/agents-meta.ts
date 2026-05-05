import agentMd from '../../agent.md?raw'
import { parseAgentMd } from './agent-md'

export interface AgentMeta {
  id: string
  name: string
  title: string
  description: string
  starters: string[]
}

const agentFiles = import.meta.glob('../../agents/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const registry = new Map<string, AgentMeta>()

for (const [path, raw] of Object.entries(agentFiles)) {
  const id = path.split('/').pop()!.replace('.md', '')
  const { meta } = parseAgentMd(raw)
  registry.set(id, {
    id,
    name: meta.name ?? id,
    title: meta.title ?? meta.name ?? id,
    description: meta.description ?? 'Ask me anything.',
    starters: meta.starters ?? [],
  })
}

const defaultParsed = parseAgentMd(agentMd)
const defaultMeta: AgentMeta = {
  id: defaultParsed.meta.name ?? 'agent',
  name: defaultParsed.meta.name ?? 'agent',
  title: defaultParsed.meta.title ?? defaultParsed.meta.name ?? 'Agent',
  description: defaultParsed.meta.description ?? 'Ask me anything.',
  starters: defaultParsed.meta.starters ?? [],
}

export function getAgentMeta(id?: string | null): AgentMeta {
  return (id ? registry.get(id) : undefined) ?? defaultMeta
}

export function listAgentsMeta(): AgentMeta[] {
  return [defaultMeta, ...registry.values()]
}
