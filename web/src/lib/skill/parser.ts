export interface ParsedSkill {
  meta: Record<string, unknown>
  body: string
}

function parseFrontmatter(yaml: string): Record<string, unknown> {
  const meta: Record<string, unknown> = {}
  const lines = yaml.split('\n')
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim() || line.trim().startsWith('#')) { i++; continue }
    const col = line.indexOf(': ')
    if (col === -1) { i++; continue }
    const key = line.slice(0, col).trim()
    if (!key) { i++; continue }
    const inline = line.slice(col + 2).trim()
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

export function parse(md: string): ParsedSkill {
  const parts = md.split(FENCE)
  if (parts.length < 3) return { meta: {}, body: md.trim() }
  const yaml = parts[1]
  const body = parts.slice(2).join('---').trim()
  try {
    return { meta: parseFrontmatter(yaml), body }
  } catch {
    // Lenient retry: strip lines with unquoted colons in values
    const cleaned = yaml.split('\n')
      .filter(l => !l.match(/^[^:#][^:]*:[^:]*:[^:]*/))
      .join('\n')
    return { meta: parseFrontmatter(cleaned), body }
  }
}
