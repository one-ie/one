const FONT_ALLOWLIST = ['system-ui', 'Inter', 'Georgia', 'serif', 'sans-serif', 'monospace', 'Lato', 'Merriweather', 'Roboto']
export const COLOR_KEYS = ['primary', 'secondary', 'tertiary', 'background', 'foreground', 'font'] as const
export type SiteToken = (typeof COLOR_KEYS)[number]

export interface SiteConfig {
  name?: string
  tagline?: string
  tokens: Partial<Record<SiteToken, string>>
  font?: string
  styleBlock: string
}

function parseFrontmatter(md: string): Record<string, string> {
  const match = /^---\n([\s\S]*?)\n---/.exec(md)
  if (!match) return {}
  const result: Record<string, string> = {}
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':')
    if (colon < 1) continue
    result[line.slice(0, colon).trim()] = line.slice(colon + 1).trim()
  }
  return result
}

export function updateSiteTokens(md: string, newTokens: Record<string, string>): string {
  const fmMatch = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(md)
  const existingFm = fmMatch ? fmMatch[1] : ''
  const body = fmMatch ? fmMatch[2] : ''
  const keys: string[] = []
  const fm: Record<string, string> = {}
  for (const line of existingFm.split('\n')) {
    const colon = line.indexOf(':')
    if (colon < 1) continue
    const key = line.slice(0, colon).trim()
    fm[key] = line.slice(colon + 1).trim()
    keys.push(key)
  }
  for (const [k, v] of Object.entries(newTokens)) {
    if (!v) continue
    if (!keys.includes(k)) keys.push(k)
    fm[k] = v
  }
  return `---\n${keys.map(k => `${k}: ${fm[k]}`).join('\n')}\n---\n${body}`
}

export function parseSite(md: string): SiteConfig {
  const fm = parseFrontmatter(md)
  const tokens: Partial<Record<SiteToken, string>> = {}
  for (const key of COLOR_KEYS) {
    const val = fm[key]
    if (val && /^#[0-9a-fA-F]{3,6}$|^hsl\(/.test(val)) tokens[key] = val
  }
  const rawFont = fm['font']
  const font = rawFont && FONT_ALLOWLIST.includes(rawFont) ? rawFont : undefined
  const styleLines = (Object.entries(tokens) as [SiteToken, string][]).map(([k, v]) => `  --color-${k}: ${v};`)
  if (font) styleLines.push(`  --font-sans: '${font}', system-ui, sans-serif;`)
  const styleBlock = styleLines.length ? `html:root {\n${styleLines.join('\n')}\n}` : ''
  return {
    name: fm['name'] || undefined,
    tagline: fm['tagline'] || undefined,
    tokens,
    font,
    styleBlock,
  }
}
