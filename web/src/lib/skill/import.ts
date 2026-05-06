import { parse } from './parser'
import { toSkill, type Skill } from './loader'

const ALLOWED_HOSTS = new Set(['agentskills.io', 'raw.githubusercontent.com', 'github.com'])
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/

function resolveSkillUrl(ref: string): string {
  if (ref.startsWith('http://') || ref.startsWith('https://')) {
    const host = new URL(ref).hostname
    if (!ALLOWED_HOSTS.has(host)) throw new Error(`host not allowed: ${host}`)
    return ref
  }
  if (ref.startsWith('github:')) {
    const path = ref.slice(7)
    const segments = path.split('/')
    const nameAtVer = segments.pop() ?? ''
    const [name, ver = 'main'] = nameAtVer.split('@')
    const repo = segments.slice(0, 2).join('/')
    const rest = segments.slice(2).join('/')
    return `https://raw.githubusercontent.com/${repo}/refs/heads/${ver}/${rest ? rest + '/' : ''}${name}/SKILL.md`
  }
  return `https://agentskills.io/skill/${ref}/SKILL.md`
}

async function sha16(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16)
}

export async function importSkill(
  ref: string,
  slug: string,
  r2: R2Bucket,
): Promise<{ skill: Skill; cacheKey: string } | null> {
  if (!SLUG_RE.test(slug)) throw new Error(`invalid slug: ${slug}`)
  const url = resolveSkillUrl(ref)
  const res = await fetch(url)
  if (!res.ok) return null
  const text = await res.text()
  const hash = await sha16(text)
  const cacheKey = `${slug}/skills/_remote/${hash}/SKILL.md`
  await r2.put(cacheKey, text, {
    customMetadata: { sourceUrl: url, importedAt: new Date().toISOString() },
  })
  const indexKey = `${slug}/skills/_remote/index.json`
  const existing = await r2.get(indexKey)
  const index: Record<string, string> = existing
    ? JSON.parse(await existing.text())
    : {}
  index[ref] = cacheKey
  await r2.put(indexKey, JSON.stringify(index))
  const stem = ref.includes('/') ? (ref.split('/').pop() ?? ref).split('@')[0] : ref.split('@')[0]
  return { skill: toSkill(parse(text, { pathStem: stem })), cacheKey }
}
