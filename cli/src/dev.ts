import { Command } from 'commander'
import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export function devCmd(): Command {
  const cmd = new Command('dev')
    .description('Run the full Cloudflare stack locally (build + migrate + wrangler dev)')
    .option('-p, --port <port>', 'HTTP port', '8787')
    .option('--ip <ip>', 'Bind address', '127.0.0.1')
    .option('--remote', 'Use remote bindings (real D1/KV/R2)', false)
    .option('--skip-build', 'Skip astro build before wrangler dev', false)
    .option('--skip-migrate', 'Skip D1 migrations', false)
    .option('--cwd <path>', 'Project directory (must contain wrangler.toml)', process.cwd())
    .action(async (opts: { port: string; ip: string; remote: boolean; skipBuild: boolean; skipMigrate: boolean; cwd: string }) => {
      const cwd = resolve(opts.cwd)
      const wranglerToml = resolve(cwd, 'wrangler.toml')
      if (!existsSync(wranglerToml)) {
        process.stderr.write(`no wrangler.toml at ${cwd}\n`)
        process.exit(1)
      }

      if (!opts.skipBuild) {
        const built = await run('npm', ['run', 'build'], cwd)
        if (built !== 0) process.exit(built)
      }

      if (!opts.skipMigrate) {
        for (const binding of d1Bindings(wranglerToml)) {
          const target = opts.remote ? '--remote' : '--local'
          const code = await run('npx', ['wrangler', 'd1', 'migrations', 'apply', binding, target], cwd)
          if (code !== 0) {
            process.stderr.write(`d1 migrations failed for ${binding}\n`)
            process.exit(code)
          }
        }
      }

      const args = ['dev', '--port', opts.port, '--ip', opts.ip]
      if (opts.remote) args.push('--remote')
      else args.push('--local')

      const code = await run('npx', ['wrangler', ...args], cwd)
      process.exit(code)
    })

  return cmd
}

function d1Bindings(wranglerToml: string): string[] {
  const text = readFileSync(wranglerToml, 'utf8')
  const blocks = text.match(/\[\[d1_databases\]\][^[]*/g) ?? []
  const bindings: string[] = []
  for (const block of blocks) {
    const m = block.match(/binding\s*=\s*["']([^"']+)["']/)
    if (m) bindings.push(m[1])
  }
  return bindings
}

function run(bin: string, args: string[], cwd: string): Promise<number> {
  return new Promise(resolveP => {
    const child = spawn(bin, args, { cwd, stdio: 'inherit', env: process.env })
    child.on('exit', code => resolveP(code ?? 0))
    child.on('error', err => { process.stderr.write(`${err.message}\n`); resolveP(1) })
  })
}
