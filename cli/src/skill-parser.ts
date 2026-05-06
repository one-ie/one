// Mirror of web/src/lib/skill/parser.ts — keep in sync.
// TODO: dedupe via @oneie/sdk export once SDK ships skill helpers.

export interface Diagnostic {
  level: 'warn' | 'info'
  code: string
  message: string
}

export interface ParsedSkill {
  meta: Record<string, unknown>
  body: string
  diagnostics: Diagnostic[]
}

export interface ParseOptions {
  pathStem?: string
}

function parseFrontmatter(yaml: string): Record<string, unknown> {
  const meta: Record<string, unknown> = {}
  const lines = yaml.split('\n')
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim() || line.trim().startsWith('#')) { i++; continue }
    let col = line.indexOf(': ')
    let inlineStart = col === -1 ? -1 : col + 2
    if (col === -1 && /^[A-Za-z0-9_-]+:\s*$/.test(line)) {
      col = line.indexOf(':')
      inlineStart = line.length
    }
    if (col === -1) { i++; continue }
    const key = line.slice(0, col).trim()
    if (!key) { i++; continue }
    const inline = line.slice(inlineStart).trim()
    const arr: string[] = []
    let j = i + 1
    while (j < lines.length && lines[j].trim().startsWith('- ')) {
      arr.push(lines[j].trim().slice(2))
      j++
    }
    if (arr.length > 0) { meta[key] = arr; i = j }
    else { meta[key] = inline === '' ? true : inline; i++ }
  }
  return meta
}

const FENCE = /^---\s*$/m

function firstParagraph(body: string): string | undefined {
  const trimmed = body.trim()
  if (!trimmed) return undefined
  for (const chunk of trimmed.split(/\n\s*\n/)) {
    const para = chunk.split('\n').filter(l => !l.startsWith('#')).join(' ').trim()
    if (para) return para
  }
  return undefined
}

export function parse(md: string, opts: ParseOptions = {}): ParsedSkill {
  const diagnostics: Diagnostic[] = []
  const parts = md.split(FENCE)
  let meta: Record<string, unknown> = {}
  let body: string

  if (parts.length < 3) {
    body = md.trim()
    if (opts.pathStem) {
      meta.name = opts.pathStem
      diagnostics.push({ level: 'warn', code: 'no-frontmatter', message: `No frontmatter; deriving name='${opts.pathStem}' from path` })
    } else {
      diagnostics.push({ level: 'warn', code: 'no-frontmatter', message: 'No frontmatter and no pathStem provided' })
    }
  } else {
    const yaml = parts[1]
    body = parts.slice(2).join('---').trim()
    try {
      meta = parseFrontmatter(yaml)
    } catch {
      const cleaned = yaml.split('\n').filter(l => !l.match(/^[^:#][^:]*:[^:]*:[^:]*/)).join('\n')
      meta = parseFrontmatter(cleaned)
      diagnostics.push({ level: 'warn', code: 'lenient-yaml', message: 'Frontmatter required lenient retry (unquoted colons)' })
    }
  }

  if (!meta.name && opts.pathStem) {
    meta.name = opts.pathStem
    diagnostics.push({ level: 'warn', code: 'missing-name', message: `Missing name; using path stem '${opts.pathStem}'` })
  }
  if (opts.pathStem && meta.name && meta.name !== opts.pathStem) {
    diagnostics.push({ level: 'warn', code: 'name-mismatch', message: `name='${String(meta.name)}' does not match path stem '${opts.pathStem}'` })
  }
  if (typeof meta.name === 'string' && meta.name.length > 64) {
    diagnostics.push({ level: 'warn', code: 'name-too-long', message: `name length ${meta.name.length} exceeds 64 chars` })
  }
  if (!meta.description) {
    const para = firstParagraph(body)
    if (para) {
      meta.description = para
      diagnostics.push({ level: 'info', code: 'description-from-body', message: 'Derived description from first body paragraph' })
    }
  }
  const triggersStr = typeof meta.triggers === 'string'
    ? meta.triggers
    : Array.isArray(meta.triggers)
      ? meta.triggers.map(String).join(', ')
      : ''
  if (triggersStr) {
    const base = typeof meta.description === 'string' ? meta.description : ''
    meta.description = base ? `${base} Triggers: ${triggersStr}` : `Triggers: ${triggersStr}`
    diagnostics.push({ level: 'info', code: 'triggers-merged', message: "'triggers' field merged into description" })
  }

  return { meta, body, diagnostics }
}
