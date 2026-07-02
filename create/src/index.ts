#!/usr/bin/env node
// create-one-app — scaffolds a ONE-connected Astro site.
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import prompts from 'prompts'
import kleur from 'kleur'

// The repo's site/ ships inside this package under template/ (see package.json `files`).
const HERE = dirname(fileURLToPath(import.meta.url))
const TEMPLATE = resolve(HERE, '..', 'template')

async function main() {
  console.log(kleur.bold().cyan('\n  create-one-app — a ONE-connected Astro site\n'))

  const answers = await prompts([
    { type: 'text', name: 'name', message: 'Project name', initial: 'my-one-app' },
    { type: 'password', name: 'apiKey', message: 'ONE_API_KEY (optional — press enter to skip)' },
    {
      type: 'select',
      name: 'mode',
      message: 'Mode',
      choices: [
        { title: 'BaaS — connect to ONE backend (recommended)', value: 'baas' },
        { title: 'Standalone — local auth + D1', value: 'standalone' },
      ],
      initial: 0,
    },
  ])

  if (!answers.name) {
    console.log(kleur.red('Cancelled.'))
    process.exit(1)
  }

  const target = resolve(process.cwd(), answers.name)
  if (existsSync(target)) {
    console.log(kleur.red(`Directory ${answers.name} already exists.`))
    process.exit(1)
  }

  mkdirSync(target, { recursive: true })
  cpSync(TEMPLATE, target, { recursive: true })

  const baseUrl = 'https://api.one.ie'
  writeFileSync(
    join(target, '.env'),
    `ONE_BASE_URL=${baseUrl}\nONE_API_KEY=${answers.apiKey ?? ''}\nBETTER_AUTH_SECRET=change-me-in-production\n`,
  )

  writeFileSync(
    join(target, 'one.config.ts'),
    `import { defineOne } from '@oneie/frontend'\n\nexport default defineOne({\n  backend: { baseUrl: ${JSON.stringify(baseUrl)}, apiKey: process.env.ONE_API_KEY },\n  brand: { tokens: {} },\n  plugins: [],\n})\n`,
  )

  console.log(kleur.green(`\n  Created ${answers.name} (${answers.mode} mode)\n`))
  console.log(`  cd ${answers.name} && bun install && bun run dev\n`)
}

main().catch((err) => {
  console.error(kleur.red(String(err)))
  process.exit(1)
})
