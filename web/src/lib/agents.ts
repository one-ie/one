import agentMd from '../../agent.md?raw'
import { parseAgentMd, type AgentSkill } from './agent-md'

export interface ResolvedSkill {
  name: string
  title: string
  description: string
  price: number
  tags: string[]
}

export interface AgentEntry {
  id: string
  name: string
  title: string
  model: string
  systemPrompt: string
  tools?: string[]           // platform tool whitelist (undefined = all)
  skills: ResolvedSkill[]
}

// Shared skills registry — skills/*.md files
const skillFiles = import.meta.glob('../../skills/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const skillsRegistry = new Map<string, ResolvedSkill>()
for (const [path, raw] of Object.entries(skillFiles)) {
  const id = path.split('/').pop()!.replace('.md', '')
  const { meta } = parseAgentMd(raw)
  skillsRegistry.set(id, {
    name: meta.name ?? id,
    title: meta.title ?? meta.name ?? id,
    description: meta.description ?? '',
    price: meta.price ?? 0,
    tags: meta.tags ?? [],
  })
}

function resolveSkills(skills?: AgentSkill[]): ResolvedSkill[] {
  if (!skills) return []
  return skills.flatMap(s => {
    if ('ref' in s) {
      const resolved = skillsRegistry.get(s.ref)
      return resolved ? [resolved] : []
    }
    return [{
      name: s.name,
      title: s.title ?? s.name,
      description: s.description ?? '',
      price: s.price ?? 0,
      tags: s.tags ?? [],
    }]
  })
}

function buildEntry(id: string, raw: string): AgentEntry {
  const { meta, prompt } = parseAgentMd(raw)
  return {
    id,
    name: meta.name ?? id,
    title: meta.title ?? meta.name ?? id,
    model: meta.model ?? 'meta-llama/llama-4-scout-17b-16e-instruct',
    systemPrompt: prompt,
    tools: meta.tools,
    skills: resolveSkills(meta.skills),
  }
}

// Agent files registry
const agentFiles = import.meta.glob('../../agents/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const registry = new Map<string, AgentEntry>()
for (const [path, raw] of Object.entries(agentFiles)) {
  const id = path.split('/').pop()!.replace('.md', '')
  registry.set(id, buildEntry(id, raw))
}

const defaultParsed = parseAgentMd(agentMd)
const defaultAgent: AgentEntry = buildEntry(defaultParsed.meta.name ?? 'agent', agentMd)

export function getAgent(id?: string | null): AgentEntry {
  return (id ? registry.get(id) : undefined) ?? defaultAgent
}

export function listAgents(): AgentEntry[] {
  return [defaultAgent, ...registry.values()]
}
