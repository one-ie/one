import { Command } from 'commander'
import { writeFileSync, readFileSync, existsSync, mkdirSync, chmodSync, unlinkSync } from 'node:fs'
import { resolve } from 'node:path'
import { homedir } from 'node:os'

const CONFIG_DIR = resolve(homedir(), '.config', 'oneie')
const KEY_FILE = resolve(CONFIG_DIR, 'key')

export function authCmd(): Command {
  const cmd = new Command('auth').description('Authentication')

  cmd.command('login')
    .description('Store API key at ~/.config/oneie/key (permissions 0600)')
    .option('--key <key>', 'API key (or set ONEIE_API_KEY env var)')
    .action((opts: { key?: string }) => {
      const key = opts.key ?? process.env.ONEIE_API_KEY
      if (!key) {
        console.error('Provide --key <key> or set ONEIE_API_KEY')
        process.exit(1)
      }
      mkdirSync(CONFIG_DIR, { recursive: true })
      writeFileSync(KEY_FILE, key, { mode: 0o600 })
      chmodSync(KEY_FILE, 0o600)
      out(cmd, { ok: true, stored: KEY_FILE, permissions: '0600' })
    })

  cmd.command('logout')
    .description('Remove stored API key')
    .action(() => {
      if (existsSync(KEY_FILE)) {
        unlinkSync(KEY_FILE)
        out(cmd, { ok: true, cleared: KEY_FILE })
      } else {
        out(cmd, { ok: true, cleared: null, note: 'no key was stored' })
      }
    })

  return cmd
}

export function loadKey(): string | null {
  if (process.env.ONEIE_API_KEY) return process.env.ONEIE_API_KEY
  if (existsSync(KEY_FILE)) {
    const val = readFileSync(KEY_FILE, 'utf8').trim()
    return val || null
  }
  return null
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
    console.error('✗', String(data.error))
  }
}
