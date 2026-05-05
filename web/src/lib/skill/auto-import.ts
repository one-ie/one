import skillMd from '../../../../agents/skill-creator/SKILL.md?raw'
import graderMd from '../../../../agents/skill-creator/agents/grader.md?raw'
import analyzerMd from '../../../../agents/skill-creator/agents/analyzer.md?raw'
import comparatorMd from '../../../../agents/skill-creator/agents/comparator.md?raw'
import schemasMd from '../../../../agents/skill-creator/references/schemas.md?raw'
import licenseMd from '../../../../agents/skill-creator/LICENSE-NOTICE.md?raw'

const FILES: [string, string][] = [
  ['skills/skill-creator/SKILL.md', skillMd],
  ['skills/skill-creator/agents/grader.md', graderMd],
  ['skills/skill-creator/agents/analyzer.md', analyzerMd],
  ['skills/skill-creator/agents/comparator.md', comparatorMd],
  ['skills/skill-creator/references/schemas.md', schemasMd],
  ['skills/skill-creator/LICENSE-NOTICE.md', licenseMd],
]

export async function autoImportSkillCreator(slug: string, content: R2Bucket): Promise<void> {
  await Promise.all(FILES.map(([path, body]) => content.put(`${slug}/${path}`, body)))
}
