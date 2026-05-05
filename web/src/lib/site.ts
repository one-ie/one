const FONT_ALLOWLIST = ['system-ui', 'Inter', 'Georgia', 'serif', 'sans-serif', 'monospace', 'Lato', 'Merriweather', 'Roboto']
const COLOR_KEYS = ['primary', 'secondary', 'tertiary', 'background', 'foreground', 'font'] as const
type SiteToken = (typeof COLOR_KEYS)[number]

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
  const styleBlock = styleLines.length ? `:root {\n${styleLines.join('\n')}\n}` : ''
  return {
    name: fm['name'] || undefined,
    tagline: fm['tagline'] || undefined,
    tokens,
    font,
    styleBlock,
  }
}
