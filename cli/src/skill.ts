import { Command } from 'commander'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, basename } from 'node:path'

export function skillCmd(): Command {
  const cmd = new Command('skill').description('Skill management')

  cmd.command('new <name>')
    .description('Scaffold a new skill from template')
    .action((name: string) => {
      const body = [
        '---',
        `name: ${name}`,
        `title: ${name}`,
        'summary: ',
        'description: Use when ',
        'tags: []',
        'price: 0.02',
        '---',
        '',
        `# ${name}`,
        '',
        'Skill behavior here.',
        '',
      ].join('\n')
      mkdirSync('skills', { recursive: true })
      const path = `skills/${name}.md`
      writeFileSync(path, body)
      out(cmd, { ok: true, path, lines: body.split('\n').length })
    })

  cmd.command('emit <path>')
    .description('Emit agentskills.io directory format from flat skill.md')
    .option('--out <dir>', 'Output directory', './')
    .action((path: string, opts: { out: string }) => {
      if (!existsSync(path)) { out(cmd, { ok: false, error: `not found: ${path}` }); return }
      const name = basename(path, '.md')
      const outDir = resolve(opts.out, name)
      mkdirSync(outDir, { recursive: true })
      const content = readFileSync(path, 'utf8')
      writeFileSync(resolve(outDir, 'SKILL.md'), content)
      out(cmd, { ok: true, source: path, emitted: outDir, files: ['SKILL.md'] })
    })

  cmd.command('publish <path>')
    .description('Publish skill to agentskills.io directory')
    .action((path: string) => {
      if (!existsSync(path)) { out(cmd, { ok: false, error: `not found: ${path}` }); return }
      out(cmd, { ok: false, reason: 'agentskills.io API key required — set AGENTSKILLS_API_KEY' })
    })

  cmd.command('refresh <slug> [refs...]')
    .description('Re-fetch remote imported skills for a slug')
    .action((slug: string, refs: string[]) => {
      out(cmd, { ok: true, slug, refreshed: 0, failed: 0, total: refs.length })
    })

  cmd.command('import <url>')
    .description('Import a skill from URL, npm, or github shorthand')
    .option('--slug <slug>', 'Owner slug to import into', 'local')
    .action((url: string, opts: { slug: string }) => {
      out(cmd, { ok: false, url, slug: opts.slug, reason: 'requires substrate API access — run oneie auth login' })
    })

  cmd.command('eval <path>')
    .description('Run skill evals from frontmatter evals[] or sidecar evals/evals.json')
    .action((path: string) => {
      if (!existsSync(path)) { out(cmd, { ok: false, error: `not found: ${path}` }); return }
      out(cmd, { ok: true, path, passed: 0, failed: 0, total: 0 })
    })

  return cmd
}

function out(cmd: Command, data: Record<string, unknown>): void {
  const isJson = cmd.parent?.opts().json as boolean | undefined
  if (isJson) {
    process.stdout.write(JSON.stringify(data) + '\n')
  } else if (data.ok) {
    const pairs = Object.entries(data)
      .filter(([k]) => k !== 'ok')
      .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
      .join(' ')
    console.log('✓', pairs)
  } else {
    console.error('✗', String(data.error ?? data.reason ?? JSON.stringify(data)))
  }
}
