import type { Skill } from './loader'
import { loadSkill } from './loader'

export async function discoverSkills(slug: string, r2: R2Bucket): Promise<Skill[]> {
  const list = await r2.list({ prefix: `${slug}/skills/` })
  const seen = new Set<string>()
  const skills: Skill[] = []
  for (const obj of list.objects) {
    const raw = obj.key
    const key = raw.endsWith('/SKILL.md')
      ? raw.replace('/SKILL.md', '')
      : raw.replace(/\.md$/, '')
    if (seen.has(key)) continue
    seen.add(key)
    const skill = await loadSkill(key, r2)
    if (skill) skills.push(skill)
  }
  return skills
}

export async function discoverSkillNames(slug: string, r2: R2Bucket): Promise<string[]> {
  const list = await r2.list({ prefix: `${slug}/skills/` })
  return list.objects
    .map(o => o.key)
    .filter(k => k.endsWith('.md') || k.endsWith('/SKILL.md'))
    .map(k =>
      k
        .replace(`${slug}/skills/`, '')
        .replace(/\/SKILL\.md$/, '')
        .replace(/\.md$/, ''),
    )
    .filter((v, i, a) => a.indexOf(v) === i)
}
