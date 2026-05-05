import { marked } from 'marked'

export interface FrontmatterResult {
  frontmatter: Record<string, unknown>
  body: string
}

export function splitFrontmatter(raw: string): FrontmatterResult {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { frontmatter: {}, body: raw }
  const fm: Record<string, unknown> = {}
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':')
    if (colon > 0) {
      const key = line.slice(0, colon).trim()
      const val = line.slice(colon + 1).trim()
      fm[key] = val
    }
  }
  return { frontmatter: fm, body: match[2] }
}

export function renderMarkdown(body: string): string {
  return String(marked(body, { gfm: true, breaks: true }))
}
