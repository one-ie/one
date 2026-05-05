/**
 * compile.ts — Agent markdown → compilation targets
 *
 * Usage:
 *   import { compileAgent } from "@oneie/sdk/compile"
 *
 *   const py = compileAgent(agentMd, { skills, target: 'uagents' })
 *   const mcp = compileAgent(agentMd, { skills, target: 'mcp' })
 */

// ── YAML parser (recursive, no external deps) ────────────────────────────────

function yamlScalar(s: string): unknown {
  if (s === 'true') return true
  if (s === 'false') return false
  if (s === 'null' || s === '~' || s === '') return null
  if (/^-?\d+$/.test(s)) return parseInt(s, 10)
  if (/^-?\d*\.\d+$/.test(s)) return parseFloat(s)
  if (s.startsWith('[')) return yamlInlineSeq(s)
  if (s.startsWith('{')) return yamlInlineMap(s)
  return s.replace(/^["']|["']$/g, '')
}

function splitCommaRespectingDepth(s: string): string[] {
  const parts: string[] = []
  let depth = 0
  let cur = ''
  for (const ch of s) {
    if (ch === '[' || ch === '{') { depth++; cur += ch }
    else if (ch === ']' || ch === '}') { depth--; cur += ch }
    else if (ch === ',' && depth === 0) { parts.push(cur.trim()); cur = '' }
    else cur += ch
  }
  if (cur.trim()) parts.push(cur.trim())
  return parts
}

function yamlInlineSeq(s: string): unknown[] {
  const inner = s.slice(1, -1).trim()
  if (!inner) return []
  return splitCommaRespectingDepth(inner)
    .map(t => yamlScalar(t.replace(/^["']|["']$/g, '')))
    .filter(v => v !== null && v !== '')
}

function yamlInlineMap(s: string): Record<string, unknown> {
  const inner = s.slice(1, -1).trim()
  if (!inner) return {}
  const obj: Record<string, unknown> = {}
  for (const part of splitCommaRespectingDepth(inner)) {
    const colon = part.indexOf(':')
    if (colon === -1) continue
    const k = part.slice(0, colon).trim()
    const v = part.slice(colon + 1).trim()
    obj[k] = yamlScalar(v)
  }
  return obj
}

function indentOf(line: string): number {
  let i = 0
  while (i < line.length && line[i] === ' ') i++
  return i
}

type YamlLines = string[]

/** Parse lines[start..] that belong to indent level `indent`. Returns [value, nextIndex]. */
function yamlBlock(lines: YamlLines, start: number, indent: number): [unknown, number] {
  // Find first non-empty line at this level
  let i = start
  while (i < lines.length && (lines[i].trim() === '' || lines[i].trim().startsWith('#'))) i++
  if (i >= lines.length) return [null, i]

  const lineIndent = indentOf(lines[i])
  if (lineIndent < indent) return [null, i]

  const content = lines[i].trimStart()

  // Detect: sequence or mapping
  if (content.startsWith('- ')) {
    return yamlSeq(lines, i, lineIndent)
  }
  return yamlMap(lines, i, lineIndent)
}

function yamlMap(lines: YamlLines, start: number, indent: number): [Record<string, unknown>, number] {
  const obj: Record<string, unknown> = {}
  let i = start

  while (i < lines.length) {
    const line = lines[i]
    if (line.trim() === '' || line.trim().startsWith('#')) { i++; continue }
    const li = indentOf(line)
    if (li < indent) break
    if (li > indent) { i++; continue }

    const content = line.trimStart()

    // List item at this level — stop, let parent handle
    if (content.startsWith('- ')) break

    const colon = content.indexOf(':')
    if (colon === -1) { i++; continue }

    const key = content.slice(0, colon).trim()
    const val = content.slice(colon + 1).trim()

    if (val !== '') {
      obj[key] = yamlScalar(val)
      i++
    } else {
      // Look ahead for child block
      let j = i + 1
      while (j < lines.length && (lines[j].trim() === '' || lines[j].trim().startsWith('#'))) j++

      if (j >= lines.length || indentOf(lines[j]) <= indent) {
        obj[key] = null
        i++
      } else {
        const childIndent = indentOf(lines[j])
        const [childValue, nextI] = yamlBlock(lines, j, childIndent)
        obj[key] = childValue
        i = nextI
      }
    }
  }

  return [obj, i]
}

function yamlSeq(lines: YamlLines, start: number, indent: number): [unknown[], number] {
  const list: unknown[] = []
  let i = start

  while (i < lines.length) {
    const line = lines[i]
    if (line.trim() === '' || line.trim().startsWith('#')) { i++; continue }
    const li = indentOf(line)
    if (li < indent) break
    if (li > indent) { i++; continue }

    const content = line.trimStart()
    if (!content.startsWith('- ')) break

    const itemContent = content.slice(2).trim()
    i++

    if (itemContent === '') {
      // Next block is the item value
      let j = i
      while (j < lines.length && (lines[j].trim() === '' || lines[j].trim().startsWith('#'))) j++
      if (j < lines.length && indentOf(lines[j]) > indent) {
        const [val, nextI] = yamlBlock(lines, j, indentOf(lines[j]))
        list.push(val)
        i = nextI
      }
    } else if (itemContent.includes(':')) {
      // Inline first key-value of an object item
      const colon = itemContent.indexOf(':')
      const k = itemContent.slice(0, colon).trim()
      const v = itemContent.slice(colon + 1).trim()
      const obj: Record<string, unknown> = { [k]: v !== '' ? yamlScalar(v) : null }

      // Collect continuation lines at greater indent
      while (i < lines.length) {
        if (lines[i].trim() === '' || lines[i].trim().startsWith('#')) { i++; continue }
        const nextLi = indentOf(lines[i])
        if (nextLi <= indent) break
        if (lines[i].trimStart().startsWith('- ')) break
        const rest = lines[i].trimStart()
        const c2 = rest.indexOf(':')
        if (c2 !== -1) {
          const k2 = rest.slice(0, c2).trim()
          const v2 = rest.slice(c2 + 1).trim()
          if (v2 !== '') {
            obj[k2] = yamlScalar(v2)
            i++
          } else {
            // Nested child inside list item
            let j = i + 1
            while (j < lines.length && (lines[j].trim() === '' || lines[j].trim().startsWith('#'))) j++
            if (j < lines.length && indentOf(lines[j]) > nextLi) {
              const [childVal, nextI] = yamlBlock(lines, j, indentOf(lines[j]))
              obj[k2] = childVal
              i = nextI
            } else {
              obj[k2] = null
              i++
            }
          }
        } else { i++ }
      }
      list.push(obj)
    } else {
      list.push(yamlScalar(itemContent))
    }
  }

  return [list, i]
}

function parseFrontmatter(yaml: string): Record<string, unknown> {
  const lines = yaml.split('\n')
  const [result] = yamlMap(lines, 0, 0)
  return result
}

// ── Agent types ───────────────────────────────────────────────────────────────

export interface AgentSkillRef { ref: string }
export interface AgentSkillInline {
  name: string; title?: string; description?: string
  price?: number; currency?: string; tags?: string[]
  when_to_use?: string
  inputSchema?: Record<string, unknown>
  outputSchema?: Record<string, unknown>
  version?: string
}
export type AgentSkill = AgentSkillRef | AgentSkillInline

export interface AgentInterval { period: number; task: string }
export interface AgentEndpoint {
  method: 'GET' | 'POST'; path: string
  request?: string; response: string
}

export interface AgentMeta {
  name?: string; title?: string; version?: string; model?: string
  group?: string; channels?: string[]; lifecycle?: string
  wallet?: string; sensitivity?: number
  description?: string; starters?: string[]
  skills?: AgentSkill[]; tools?: string[]
  seed?: string; port?: number; agentverse?: string; mailbox?: boolean
  startup?: string; shutdown?: string
  intervals?: AgentInterval[]; endpoints?: AgentEndpoint[]; bureau?: string[]
  price?: number; currency?: string; tags?: string[]
  when_to_use?: string
  inputSchema?: Record<string, unknown>
  outputSchema?: Record<string, unknown>
}

export interface ParsedAgent { meta: AgentMeta; prompt: string }

function coerceAgentMeta(raw: Record<string, unknown>): AgentMeta {
  const str = (v: unknown) => (v != null ? String(v) : undefined)
  const num = (v: unknown) => (typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(v) : undefined)
  const int = (v: unknown) => (typeof v === 'number' ? Math.floor(v) : typeof v === 'string' ? parseInt(v, 10) : undefined)
  const bool = (v: unknown) => (typeof v === 'boolean' ? v : v === 'true' ? true : false)
  const strList = (v: unknown): string[] | undefined =>
    Array.isArray(v) ? v.map(String) : v != null ? String(v).split(',').map(s => s.trim()) : undefined

  const coerceSkills = (v: unknown): AgentSkill[] | undefined => {
    if (!Array.isArray(v)) return undefined
    return v.map(item => {
      if (typeof item === 'string') return { ref: item }
      if (typeof item === 'object' && item !== null) {
        const o = item as Record<string, unknown>
        if (typeof o.ref === 'string') return { ref: o.ref }
        return {
          name: String(o.name ?? ''),
          title: str(o.title),
          description: str(o.description),
          price: num(o.price) ?? 0,
          tags: strList(o.tags) ?? [],
          version: str(o.version),
          inputSchema: o.inputSchema as Record<string, unknown> | undefined,
          outputSchema: o.outputSchema as Record<string, unknown> | undefined,
          when_to_use: str(o.when_to_use),
        }
      }
      return { ref: String(item) }
    })
  }

  const coerceIntervals = (v: unknown): AgentInterval[] | undefined => {
    if (!Array.isArray(v)) return undefined
    return v.flatMap(item => {
      if (typeof item !== 'object' || item === null) return []
      const o = item as Record<string, unknown>
      const period = int(o.period)
      const task = str(o.task)
      if (period == null || task == null) return []
      return [{ period, task }]
    })
  }

  const coerceEndpoints = (v: unknown): AgentEndpoint[] | undefined => {
    if (!Array.isArray(v)) return undefined
    return v.flatMap(item => {
      if (typeof item !== 'object' || item === null) return []
      const o = item as Record<string, unknown>
      const method = (str(o.method) ?? 'GET').toUpperCase() as 'GET' | 'POST'
      const path = str(o.path)
      const response = str(o.response)
      if (!path || !response) return []
      return [{ method, path, request: str(o.request), response }]
    })
  }

  return {
    name: str(raw.name),
    title: str(raw.title),
    version: str(raw.version),
    model: str(raw.model),
    group: str(raw.group),
    channels: strList(raw.channels),
    lifecycle: str(raw.lifecycle),
    wallet: str(raw.wallet),
    sensitivity: num(raw.sensitivity),
    description: str(raw.description),
    starters: strList(raw.starters),
    skills: coerceSkills(raw.skills),
    tools: strList(raw.tools),
    seed: str(raw.seed),
    port: int(raw.port),
    agentverse: str(raw.agentverse),
    mailbox: raw.mailbox != null ? bool(raw.mailbox) : undefined,
    startup: str(raw.startup),
    shutdown: str(raw.shutdown),
    intervals: coerceIntervals(raw.intervals),
    endpoints: coerceEndpoints(raw.endpoints),
    bureau: strList(raw.bureau),
    price: num(raw.price),
    currency: str(raw.currency),
    tags: strList(raw.tags),
    when_to_use: str(raw.when_to_use),
    inputSchema: raw.inputSchema as Record<string, unknown> | undefined,
    outputSchema: raw.outputSchema as Record<string, unknown> | undefined,
  }
}

export function parseAgentMd(raw: string): ParsedAgent {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { meta: {}, prompt: raw.trim() }
  const rawMeta = parseFrontmatter(match[1])
  return { meta: coerceAgentMeta(rawMeta), prompt: match[2].trim() }
}

// ── JSON Schema → Pydantic model ─────────────────────────────────────────────

function schemaToPython(
  schema: Record<string, unknown> | undefined,
  modelName: string,
  required: string[] = [],
): string {
  if (!schema || schema.type !== 'object') return `class ${modelName}(Model):\n    pass`

  const props = schema.properties as Record<string, Record<string, unknown>> | undefined
  if (!props || Object.keys(props).length === 0) return `class ${modelName}(Model):\n    pass`

  const typeMap: Record<string, string> = {
    string: 'str', integer: 'int', number: 'float',
    boolean: 'bool', object: 'dict', array: 'list',
  }

  const fields = Object.entries(props).map(([field, def]) => {
    const pyType = typeMap[String(def.type ?? 'string')] ?? 'str'
    const isRequired = required.includes(field)
    const snakeField = field.replace(/([A-Z])/g, m => `_${m.toLowerCase()}`)
    return isRequired
      ? `    ${snakeField}: ${pyType}`
      : `    ${snakeField}: ${pyType} | None = None`
  })

  return `class ${modelName}(Model):\n${fields.join('\n')}`
}

function toPascal(s: string): string {
  return s.replace(/[-_](.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^(.)/, (_, c: string) => c.toUpperCase())
}

function toSnake(s: string): string {
  return s.replace(/-/g, '_')
}

// ── uAgents compiler ──────────────────────────────────────────────────────────

interface ResolvedSkill {
  name: string; title: string; description: string
  version: string; prompt: string
  inputSchema?: Record<string, unknown>
  outputSchema?: Record<string, unknown>
}

function compileProtocol(skill: ResolvedSkill, llmModel: string): string {
  const pascal = toPascal(skill.name)
  const snake = toSnake(skill.name)
  const reqClass = `${pascal}Request`
  const resClass = `${pascal}Response`
  const inputRequired = (skill.inputSchema?.required as string[] | undefined) ?? []
  const outputRequired = (skill.outputSchema?.required as string[] | undefined) ?? []

  const reqModel = schemaToPython(skill.inputSchema, reqClass, inputRequired)
  const resModel = schemaToPython(skill.outputSchema, resClass, outputRequired)

  return `
# ── ${skill.title} ──────────────────────────────────────────────────────────
${reqModel}

${resModel}

${snake}_protocol = Protocol(name="${skill.name}", version="${skill.version}")

SKILL_${snake.toUpperCase()} = """
${skill.prompt}
"""

@${snake}_protocol.on_message(model=${reqClass}, replies={${resClass}})
async def ${snake}_handler(ctx: Context, sender: str, msg: ${reqClass}):
    client = Anthropic()
    result = client.messages.create(
        model="${llmModel}",
        max_tokens=1024,
        system=SKILL_${snake.toUpperCase()},
        messages=[{"role": "user", "content": str(msg.model_dump())}],
    )
    text = result.content[0].text
    await ctx.send(sender, ${resClass}.model_validate({"resolution": text}))
`.trimStart()
}

function compileUAgents(
  agentMd: string,
  skillMds: Record<string, string> = {},
): string {
  const { meta, prompt } = parseAgentMd(agentMd)
  const name = meta.name ?? 'agent'
  const llmModel = meta.model
    ? meta.model.split('/').pop() ?? 'claude-haiku-4-5'
    : 'claude-haiku-4-5'

  const skills: ResolvedSkill[] = (meta.skills ?? []).flatMap(s => {
    const skillName = 'ref' in s ? s.ref : s.name
    const raw = skillMds[skillName]
    if (!raw) return []
    const { meta: sm, prompt: sp } = parseAgentMd(raw)
    return [{
      name: sm.name ?? skillName,
      title: sm.title ?? sm.name ?? skillName,
      description: sm.description ?? '',
      version: sm.version ?? '1.0.0',
      prompt: sp,
      inputSchema: sm.inputSchema,
      outputSchema: sm.outputSchema,
    }]
  })

  const hasIntervals = (meta.intervals?.length ?? 0) > 0
  const hasEndpoints = (meta.endpoints?.length ?? 0) > 0
  const hasBureau = (meta.bureau?.length ?? 0) > 0
  const hasSkills = skills.length > 0

  const lines: string[] = [
    '# Generated by @oneie/sdk — do not edit by hand',
    `# Source: agents/${name}.md`,
    '',
    'from anthropic import Anthropic',
    hasBureau
      ? 'from uagents import Agent, Bureau, Context, Protocol'
      : 'from uagents import Agent, Context, Protocol',
  ]

  if (hasSkills) lines.push('from uagents.models import Model')
  lines.push('')

  for (const skill of skills) {
    lines.push(compileProtocol(skill, llmModel))
  }

  lines.push('# ── Agent ─────────────────────────────────────────────────────────────────────')
  lines.push('')
  lines.push('SYSTEM_PROMPT = """')
  lines.push(prompt)
  lines.push('"""')
  lines.push('')

  const agentArgs = [`    name="${name}"`]
  if (meta.seed) agentArgs.push(`    seed="${meta.seed}"`)
  if (meta.port && meta.port !== 8000) agentArgs.push(`    port=${meta.port}`)
  if (meta.mailbox) agentArgs.push(`    mailbox=True`)

  lines.push(`${name} = Agent(`)
  lines.push(agentArgs.join(',\n') + ',')
  lines.push(')')
  lines.push('')

  for (const skill of skills) {
    lines.push(`${name}.include(${toSnake(skill.name)}_protocol, publish_manifest=True)`)
  }
  if (hasSkills) lines.push('')

  if (meta.startup) {
    lines.push(`@${name}.on_event("startup")`)
    lines.push(`async def on_startup(ctx: Context):`)
    lines.push(`    client = Anthropic()`)
    lines.push(`    result = client.messages.create(`)
    lines.push(`        model="${llmModel}", max_tokens=256, system=SYSTEM_PROMPT,`)
    lines.push(`        messages=[{"role": "user", "content": "${meta.startup.replace(/"/g, '\\"')}"}],`)
    lines.push(`    )`)
    lines.push(`    ctx.logger.info(result.content[0].text)`)
    lines.push('')
  }

  if (meta.shutdown) {
    lines.push(`@${name}.on_event("shutdown")`)
    lines.push(`async def on_shutdown(ctx: Context):`)
    lines.push(`    client = Anthropic()`)
    lines.push(`    result = client.messages.create(`)
    lines.push(`        model="${llmModel}", max_tokens=256, system=SYSTEM_PROMPT,`)
    lines.push(`        messages=[{"role": "user", "content": "${meta.shutdown.replace(/"/g, '\\"')}"}],`)
    lines.push(`    )`)
    lines.push(`    ctx.logger.info(result.content[0].text)`)
    lines.push('')
  }

  if (hasIntervals) {
    for (const [idx, interval] of (meta.intervals ?? []).entries()) {
      lines.push(`@${name}.on_interval(period=${interval.period})`)
      lines.push(`async def interval_${idx}(ctx: Context):`)
      lines.push(`    client = Anthropic()`)
      lines.push(`    result = client.messages.create(`)
      lines.push(`        model="${llmModel}", max_tokens=512, system=SYSTEM_PROMPT,`)
      lines.push(`        messages=[{"role": "user", "content": "${interval.task.replace(/"/g, '\\"')}"}],`)
      lines.push(`    )`)
      lines.push(`    ctx.logger.info(result.content[0].text)`)
      lines.push('')
    }
  }

  if (hasEndpoints) {
    lines.push('class Response(Model):')
    lines.push('    text: str')
    lines.push('')
    for (const endpoint of meta.endpoints ?? []) {
      const fnName = `${endpoint.method.toLowerCase()}${endpoint.path.replace(/\//g, '_').replace(/[^a-z0-9_]/gi, '')}`
      if (endpoint.method === 'GET') {
        lines.push(`@${name}.on_rest_get("${endpoint.path}", Response)`)
        lines.push(`async def ${fnName}(ctx: Context) -> dict:`)
      } else {
        lines.push(`@${name}.on_rest_post("${endpoint.path}", Response)`)
        lines.push(`async def ${fnName}(ctx: Context, req: dict) -> dict:`)
      }
      lines.push(`    client = Anthropic()`)
      lines.push(`    result = client.messages.create(`)
      lines.push(`        model="${llmModel}", max_tokens=512, system=SYSTEM_PROMPT,`)
      lines.push(`        messages=[{"role": "user", "content": "${endpoint.response.replace(/"/g, '\\"')}"}],`)
      lines.push(`    )`)
      lines.push(`    return {"text": result.content[0].text}`)
      lines.push('')
    }
  }

  if (hasBureau) {
    lines.push('# ── Bureau ────────────────────────────────────────────────────────────────────')
    lines.push('')
    lines.push('bureau = Bureau()')
    lines.push(`bureau.add(${name})`)
    for (const sibling of meta.bureau ?? []) {
      lines.push(`# bureau.add(${toSnake(sibling)})  # import from ${sibling}.py`)
    }
    lines.push('')
    lines.push('if __name__ == "__main__":')
    lines.push('    bureau.run()')
  } else {
    lines.push('if __name__ == "__main__":')
    lines.push(`    ${name}.run()`)
  }

  return lines.join('\n') + '\n'
}

// ── MCP compiler ──────────────────────────────────────────────────────────────

function compileMcp(
  agentMd: string,
  skillMds: Record<string, string> = {},
): string {
  const { meta } = parseAgentMd(agentMd)

  const tools = (meta.skills ?? []).flatMap(s => {
    const skillName = 'ref' in s ? s.ref : s.name
    const raw = skillMds[skillName]
    if (!raw) return []
    const { meta: sm } = parseAgentMd(raw)
    const tool: Record<string, unknown> = {
      name: sm.name ?? skillName,
      description: sm.description ?? sm.title ?? skillName,
    }
    if (sm.inputSchema) tool.inputSchema = sm.inputSchema
    return [tool]
  })

  return JSON.stringify({
    name: meta.name ?? 'agent',
    title: meta.title ?? meta.name ?? 'Agent',
    version: meta.version ?? '1.0.0',
    tools,
  }, null, 2)
}

// ── SKILL.md compiler ─────────────────────────────────────────────────────────

function compileSkillMd(skillMds: Record<string, string>): string {
  return Object.entries(skillMds).map(([name, raw]) => {
    const { meta, prompt } = parseAgentMd(raw)
    const lines = [
      `---`,
      `name: ${meta.name ?? name}`,
      `description: ${meta.description ?? prompt.slice(0, 80).replace(/\n/g, ' ')}`,
    ]
    if (meta.when_to_use) lines.push(`when_to_use: ${meta.when_to_use}`)
    lines.push(`---`, '', prompt)
    return lines.join('\n')
  }).join('\n\n---\n\n')
}

// ── Public API ────────────────────────────────────────────────────────────────

export type CompileTarget = 'uagents' | 'mcp' | 'skillmd'

export interface CompileOpts {
  /** Skill source files — key is skill name (without .md), value is raw markdown */
  skills?: Record<string, string>
  /** Compilation target (default: uagents) */
  target?: CompileTarget
}

/**
 * Compile an agent markdown file to a target runtime.
 *
 * @param agentMd  Raw content of the agent.md file
 * @param opts     Compilation options
 * @returns        Generated source string (Python / JSON / SKILL.md)
 *
 * @example
 * ```ts
 * import { compileAgent } from "@oneie/sdk/compile"
 * import { readFileSync, readdirSync, writeFileSync } from "node:fs"
 *
 * const skills: Record<string, string> = {}
 * for (const f of readdirSync("skills")) {
 *   skills[f.replace(".md", "")] = readFileSync(`skills/${f}`, "utf8")
 * }
 *
 * const py = compileAgent(readFileSync("agents/support.md", "utf8"), { skills })
 * writeFileSync("dist/support_agent.py", py)
 * ```
 */
export function compileAgent(agentMd: string, opts: CompileOpts = {}): string {
  const target = opts.target ?? 'uagents'
  const skills = opts.skills ?? {}

  if (target === 'uagents') return compileUAgents(agentMd, skills)
  if (target === 'mcp') return compileMcp(agentMd, skills)
  if (target === 'skillmd') return compileSkillMd(skills)
  throw new Error(`Unknown target: ${target}`)
}

/**
 * Parse an agent or skill markdown file into structured metadata + prompt.
 * Handles: scalars, inline lists `[a,b]`, inline objects `{k: v}`,
 * block string lists, block object lists, and deeply nested objects
 * (including inputSchema / outputSchema).
 */
export { parseAgentMd as parse }
