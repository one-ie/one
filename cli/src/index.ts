#!/usr/bin/env node
import { Command } from 'commander'
import { agentCmd } from './agent.js'
import { skillCmd } from './skill.js'
import { authCmd } from './auth.js'
import { devCmd } from './dev.js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(
  readFileSync(resolve(__dirname, '../../package.json'), 'utf8'),
) as { version: string }

const program = new Command()
  .name('oneie')
  .description('ONE — agent CLI')
  .version(pkg.version)
  .option('--json', 'Output structured JSON')

program.addCommand(agentCmd())
program.addCommand(skillCmd())
program.addCommand(authCmd())
program.addCommand(devCmd())

program.parseAsync(process.argv).catch((err: Error) => {
  const isJson = process.argv.includes('--json')
  if (isJson) process.stdout.write(JSON.stringify({ ok: false, error: err.message }) + '\n')
  else process.stderr.write(err.message + '\n')
  process.exit(1)
})
