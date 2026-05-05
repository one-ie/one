import type { Skill } from './loader'

function buildFrontmatter(skill: Skill): string {
  const lines = ['---']
  const add = (k: string, v: unknown) => {
    if (v === undefined || v === null) return
    if (Array.isArray(v)) {
      if (v.length === 0) return
      lines.push(`${k}:`)
      v.forEach(item => lines.push(`  - ${item}`))
    } else {
      lines.push(`${k}: ${v}`)
    }
  }
  add('agentmd', '0.1')
  add('name', skill.name)
  add('title', skill.title)
  add('version', skill.version)
  add('summary', skill.summary)
  add('description', skill.description ?? skill.when_to_use)
  add('trigger', skill.trigger)
  add('tags', skill.tags)
  add('price', skill.price)
  add('license', skill.license)
  add('compatibility', skill.compatibility)
  add('scripts', skill.scripts)
  add('references', skill.references)
  add('assets', skill.assets)
  if (skill.inputSchema) lines.push(`inputSchema: ${JSON.stringify(skill.inputSchema)}`)
  if (skill.outputSchema) lines.push(`outputSchema: ${JSON.stringify(skill.outputSchema)}`)
  lines.push('---')
  return lines.join('\n')
}

// Emits a flat Skill into the agentskills.io directory layout.
// Returns Map<path, content> — callers write to R2 or disk.
export function emitSkill(skill: Skill, basePath = ''): Map<string, string> {
  const name = skill.name || 'skill'
  const prefix = basePath ? `${basePath}/${name}` : name
  const files = new Map<string, string>()
  files.set(`${prefix}/SKILL.md`, `${buildFrontmatter(skill)}\n\n${skill.body}`)
  for (const s of skill.scripts ?? []) {
    files.set(`${prefix}/scripts/${s.replace(/^\.\//, '')}`, '')
  }
  for (const r of skill.references ?? []) {
    files.set(`${prefix}/references/${r.replace(/^\.\//, '')}`, '')
  }
  for (const a of skill.assets ?? []) {
    files.set(`${prefix}/assets/${a.replace(/^\.\//, '')}`, '')
  }
  return files
}
