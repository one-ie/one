export interface Diagnostic { level: 'warn' | 'info'; code: string; message: string; path?: string }
export interface Preview { name: string; price: number; body: string }
export interface Skill {
  name: string
  title?: string
  summary?: string
  description?: string
  price?: number
  tags?: string[]
  body: string
  meta: Record<string, unknown>
  diagnostics: Diagnostic[]
}

export interface SkillsImportOpts {
  ref?: string
  content?: string
  slug: string
  price?: number
  name?: string
}

export interface SkillsImportResult {
  skill: Skill
  key: string
  preview: Preview
  diagnostics: Diagnostic[]
}

export async function skillsImport(
  config: { baseUrl: string; apiKey: string },
  opts: SkillsImportOpts,
): Promise<SkillsImportResult> {
  const res = await fetch(`${config.baseUrl}/api/skill/import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(opts),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`skills.import failed: ${res.status} ${text}`)
  }
  return (await res.json()) as SkillsImportResult
}
