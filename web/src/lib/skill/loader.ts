import { parse, type Diagnostic } from './parser'

export interface Skill {
  name: string
  title?: string
  summary?: string
  description?: string
  price?: number
  accepts?: unknown[]
  trigger?: string
  applyTo?: string[]
  tags?: string[]
  when_to_use?: string
  inputSchema?: unknown
  outputSchema?: unknown
  version?: string
  license?: string
  compatibility?: string
  scripts?: string[]
  references?: string[]
  assets?: string[]
  evals?: unknown[]
  diagnostics: Diagnostic[]
  meta: Record<string, unknown>
  body: string
}

export function toSkill(parsed: { meta: Record<string, unknown>; body: string; diagnostics?: Diagnostic[] }): Skill {
  const { meta, body } = parsed
  return {
    name: String(meta.name ?? ''),
    title: meta.title ? String(meta.title) : undefined,
    summary: meta.summary ? String(meta.summary) : undefined,
    description: meta.description ? String(meta.description) : undefined,
    price: meta.price !== undefined ? Number(meta.price) : undefined,
    accepts: Array.isArray(meta.accepts) ? meta.accepts : undefined,
    trigger: meta.trigger ? String(meta.trigger) : undefined,
    applyTo: Array.isArray(meta.applyTo) ? meta.applyTo.map(String) : undefined,
    tags: Array.isArray(meta.tags) ? meta.tags.map(String) : undefined,
    when_to_use: meta.when_to_use ? String(meta.when_to_use) : undefined,
    inputSchema: meta.inputSchema,
    outputSchema: meta.outputSchema,
    version: meta.version ? String(meta.version) : undefined,
    license: meta.license ? String(meta.license) : undefined,
    compatibility: meta.compatibility ? String(meta.compatibility) : undefined,
    scripts: Array.isArray(meta.scripts) ? meta.scripts.map(String) : undefined,
    references: Array.isArray(meta.references) ? meta.references.map(String) : undefined,
    assets: Array.isArray(meta.assets) ? meta.assets.map(String) : undefined,
    evals: Array.isArray(meta.evals) ? meta.evals : undefined,
    diagnostics: parsed.diagnostics ?? [],
    meta,
    body,
  }
}

function pathStem(key: string): string {
  const stripped = key.replace(/\.md$/, '').replace(/\/SKILL$/i, '')
  const segs = stripped.split('/')
  return segs[segs.length - 1] ?? ''
}

// Loads a skill from R2. Accepts flat key (skills/name.md) or directory key (skills/name).
export async function loadSkill(key: string, r2: R2Bucket): Promise<Skill | null> {
  const flat = await r2.get(key.endsWith('.md') ? key : `${key}.md`)
  if (flat) return toSkill(parse(await flat.text(), { pathStem: pathStem(key) }))
  const dir = key.replace(/\.md$/, '')
  const dirObj = await r2.get(`${dir}/SKILL.md`)
  if (dirObj) return toSkill(parse(await dirObj.text(), { pathStem: pathStem(dir) }))
  return null
}
