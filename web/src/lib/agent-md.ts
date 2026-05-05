// Agent markdown parser — handles agent files, skill files, and protocol files

export interface AgentSkillRef {
  ref: string
}

export interface AgentSkillInline {
  name: string
  title?: string
  description?: string
  price?: number
  tags?: string[]
}

export type AgentSkill = AgentSkillRef | AgentSkillInline

export interface AgentInterval {
  period: number           // seconds
  task: string             // LLM instruction for this tick
}

export interface AgentEndpoint {
  method: 'GET' | 'POST'
  path: string
  request?: string         // description of the request body (POST)
  response: string         // description of the response / LLM instruction
}

export interface AgentMeta {
  // Identity
  name?: string
  title?: string
  version?: string         // semver — also uAgents protocol version
  model?: string
  group?: string
  channels?: string[]
  lifecycle?: string
  wallet?: string
  sensitivity?: number

  // Persona (web chat)
  description?: string
  starters?: string[]

  // Capabilities
  skills?: AgentSkill[]    // what this agent offers
  tools?: string[]         // platform tool whitelist (omit = all; [] = none)

  // uAgents
  seed?: string            // deterministic identity seed
  port?: number            // HTTP port (default 8000)
  agentverse?: string      // agentverse URL or "true" for default
  mailbox?: boolean        // receive messages via Agentverse mailbox
  startup?: string         // LLM instruction on startup
  shutdown?: string        // LLM instruction on shutdown
  intervals?: AgentInterval[]
  endpoints?: AgentEndpoint[]
  bureau?: string[]        // sibling agents to run together

  // Skill-file fields (when the .md IS a skill, not an agent)
  price?: number
  currency?: string
  tags?: string[]
  when_to_use?: string
  inputSchema?: Record<string, unknown>
  outputSchema?: Record<string, unknown>
}

export interface ParsedAgent {
  meta: AgentMeta
  prompt: string
}

function parseInlineList(s: string): string[] {
  return s
    .slice(1, -1)
    .split(',')
    .map(t => t.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean)
}

export function parseAgentMd(raw: string): ParsedAgent {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { meta: {}, prompt: raw.trim() }

  const meta: AgentMeta = {}
  const lines = match[1].split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const colon = line.indexOf(':')
    if (colon === -1) { i++; continue }

    const key = line.slice(0, colon).trim()
    const val = line.slice(colon + 1).trim()

    if (val.startsWith('[')) {
      const list = parseInlineList(val)
      if (key === 'tools') meta.tools = list
      else if (key === 'channels') meta.channels = list
      else if (key === 'tags') meta.tags = list
      else if (key === 'bureau') meta.bureau = list
      else if (key === 'skills') meta.skills = list.map(ref => ({ ref }))
      i++
    } else if (val === '') {
      // Block value — peek at first item to classify
      i++
      if (i >= lines.length || !lines[i]?.match(/^\s{2}-/)) continue

      const firstItem = lines[i].replace(/^\s{2}-\s?/, '').trim()

      if (firstItem.includes(':')) {
        // Object list
        const objects: Record<string, unknown>[] = []
        while (i < lines.length && lines[i].match(/^\s{2}-\s?/)) {
          const obj: Record<string, unknown> = {}
          applyKV(obj, lines[i].replace(/^\s{2}-\s?/, '').trim())
          i++
          while (i < lines.length && lines[i].match(/^\s{4}\S/)) {
            applyKV(obj, lines[i].trimStart())
            i++
          }
          objects.push(obj)
        }
        if (key === 'skills') meta.skills = objects.map(toSkill)
        else if (key === 'intervals') meta.intervals = objects as unknown as AgentInterval[]
        else if (key === 'endpoints') meta.endpoints = objects as unknown as AgentEndpoint[]
      } else {
        // Simple string list
        const items: string[] = []
        while (i < lines.length && lines[i].match(/^\s{2}-\s?/)) {
          items.push(lines[i].replace(/^\s{2}-\s?/, '').trim())
          i++
        }
        if (key === 'starters') meta.starters = items
        else if (key === 'channels') meta.channels = items
        else if (key === 'tools') meta.tools = items
        else if (key === 'tags') meta.tags = items
        else if (key === 'bureau') meta.bureau = items
      }
    } else {
      if (key === 'name') meta.name = val
      else if (key === 'title') meta.title = val
      else if (key === 'version') meta.version = val
      else if (key === 'model') meta.model = val
      else if (key === 'group') meta.group = val
      else if (key === 'description') meta.description = val
      else if (key === 'lifecycle') meta.lifecycle = val
      else if (key === 'wallet') meta.wallet = val
      else if (key === 'currency') meta.currency = val
      else if (key === 'when_to_use') meta.when_to_use = val
      else if (key === 'agentverse') meta.agentverse = val
      else if (key === 'seed') meta.seed = val
      else if (key === 'startup') meta.startup = val
      else if (key === 'shutdown') meta.shutdown = val
      else if (key === 'sensitivity') meta.sensitivity = parseFloat(val)
      else if (key === 'price') meta.price = parseFloat(val)
      else if (key === 'port') meta.port = parseInt(val, 10)
      else if (key === 'mailbox') meta.mailbox = val === 'true'
      i++
    }
  }

  return { meta, prompt: match[2].trim() }
}

function applyKV(obj: Record<string, unknown>, line: string) {
  const c = line.indexOf(':')
  if (c === -1) return
  const k = line.slice(0, c).trim()
  const v = line.slice(c + 1).trim()
  if (v === '') return
  if (v.startsWith('[')) obj[k] = parseInlineList(v)
  else if (v === 'true') obj[k] = true
  else if (v === 'false') obj[k] = false
  else if (!isNaN(Number(v))) obj[k] = Number(v)
  else obj[k] = v
}

function toSkill(obj: Record<string, unknown>): AgentSkill {
  if (typeof obj.ref === 'string') return { ref: obj.ref }
  return {
    name: String(obj.name ?? ''),
    title: obj.title != null ? String(obj.title) : undefined,
    description: obj.description != null ? String(obj.description) : undefined,
    price: typeof obj.price === 'number' ? obj.price : 0,
    tags: Array.isArray(obj.tags) ? (obj.tags as string[]) : [],
  }
}
