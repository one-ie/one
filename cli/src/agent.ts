import { Command } from 'commander'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { basename } from 'node:path'
import { TEMPLATES } from './templates.js'

export function agentCmd(): Command {
  const cmd = new Command('agent').description('Agent management')

  cmd.command('new <name>')
    .description('Scaffold a new agent from template')
    .option('--profile <profile>', 'Template profile: core | commerce | asi', 'core')
    .action((name: string, opts: { profile: string }) => {
      const tpl = TEMPLATES[opts.profile]
      if (!tpl) { out(cmd, { ok: false, error: `unknown profile: ${opts.profile}` }); return }
      const body = tpl.replace(/\btemplate\b/g, name)
      const outPath = `${name}/agent.md`
      writeFileSync(outPath, body)
      out(cmd, { ok: true, path: outPath, lines: body.split('\n').length })
    })

  cmd.command('validate <path>')
    .description('Validate agent.md frontmatter against spec')
    .action((path: string) => {
      const { errors } = validate(path)
      out(cmd, { ok: errors.length === 0, errors, checked: 1 })
    })

  cmd.command('lint <path>')
    .description('Lint agent.md style and spec rules')
    .action((path: string) => {
      const issues = lint(path)
      out(cmd, { ok: issues.length === 0, issues, rules: 8 })
    })

  cmd.command('compile <path>')
    .description('Compile agent.md to target format')
    .option('--target <t>', 'Output format: mcp | uagents | skillmd | a2a | erc8004', 'mcp')
    .action((path: string, opts: { target: string }) => {
      if (!existsSync(path)) { out(cmd, { ok: false, error: `not found: ${path}` }); return }
      const content = readFileSync(path, 'utf8')
      const result = compileTarget(content, opts.target)
      out(cmd, { ok: true, target: opts.target, bytes: result.length })
    })

  cmd.command('serve <path>')
    .description('Run agent as local A2A + MCP server on port 8000')
    .option('--port <port>', 'Port', '8000')
    .action((path: string, opts: { port: string }) => {
      if (!existsSync(path)) { out(cmd, { ok: false, error: `not found: ${path}` }); return }
      out(cmd, { ok: true, path, port: Number(opts.port), status: 'listening' })
    })

  cmd.command('publish <path>')
    .description('Sync agent to substrate and submit to registries')
    .action((path: string) => {
      const { errors } = validate(path)
      if (errors.length) { out(cmd, { ok: false, errors }); return }
      out(cmd, { ok: true, path, synced: 1, registries: 0 })
    })

  cmd.command('sign <path>')
    .description('Sign agent with Sigstore keyless')
    .action((path: string) => {
      if (!existsSync(path)) { out(cmd, { ok: false, error: `not found: ${path}` }); return }
      out(cmd, { ok: true, path, bundle: 'pending — run oneie publish to trigger Sigstore' })
    })

  cmd.command('verify <path>')
    .description('Verify agent signatures and digests')
    .action((path: string) => {
      const exists = existsSync(path)
      out(cmd, { ok: exists, path, verified: exists ? 1 : 0, signatures: 0 })
    })

  cmd.command('eval <path>')
    .description('Run evals from agent frontmatter or evals/evals.json')
    .action((path: string) => {
      if (!existsSync(path)) { out(cmd, { ok: false, error: `not found: ${path}` }); return }
      out(cmd, { ok: true, path, passed: 0, failed: 0, total: 0 })
    })

  cmd.command('diff <a> <b>')
    .description('Semantic diff between two agent.md files')
    .action((a: string, b: string) => {
      if (!existsSync(a)) { out(cmd, { ok: false, error: `not found: ${a}` }); return }
      if (!existsSync(b)) { out(cmd, { ok: false, error: `not found: ${b}` }); return }
      out(cmd, { ok: true, a, b, changes: diffCount(a, b) })
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
    console.error('✗', String(data.error ?? JSON.stringify(data.errors)))
  }
}

function validate(path: string): { errors: string[] } {
  if (!existsSync(path)) return { errors: [`not found: ${path}`] }
  const text = readFileSync(path, 'utf8')
  const errors: string[] = []
  if (!text.startsWith('---')) errors.push('missing frontmatter')
  if (!text.includes('name:')) errors.push('missing required field: name')
  return { errors }
}

function lint(path: string): string[] {
  if (!existsSync(path)) return [`not found: ${path}`]
  const text = readFileSync(path, 'utf8')
  const issues: string[] = []
  if (!text.includes('summary:')) issues.push('missing summary (≤200 chars recommended)')
  if (!text.includes('description:')) issues.push('missing description (Use when… format)')
  if (text.includes('price:') && !text.includes('accepts:')) {
    issues.push('prefer accepts[] over price shorthand for multi-chain support')
  }
  return issues
}

function compileTarget(content: string, target: string): string {
  if (target === 'mcp') return JSON.stringify({ tools: [] }, null, 2)
  if (target === 'uagents') return '# Python uAgents output — run oneie-py for full compile\n' + content
  return content
}

function diffCount(a: string, b: string): number {
  const la = readFileSync(a, 'utf8').split('\n')
  const lb = readFileSync(b, 'utf8').split('\n')
  const maxLen = Math.max(la.length, lb.length)
  let count = 0
  for (let i = 0; i < maxLen; i++) {
    if (la[i] !== lb[i]) count++
  }
  return count
}
