import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createPreset, generateThemeCSS, defaultTokens } from '@oneie/design'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const WEB = join(ROOT, 'apps', 'web')
const TOKENS = ['background', 'foreground', 'font', 'primary', 'secondary', 'tertiary'] as const

describe('design tokens drive --color-* (no hex in components)', () => {
  it('Layout.astro declares all 6 --color-* tokens', () => {
    const layout = readFileSync(join(WEB, 'src/layouts/Layout.astro'), 'utf8')
    for (const k of TOKENS) {
      expect(layout, `Layout must declare --color-${k}`).toContain(`--color-${k}`)
    }
  })
})

describe('one.config.ts brand.tokens has all 6 keys', () => {
  it('declares the 6 canonical tokens', () => {
    const cfg = readFileSync(join(WEB, 'one.config.ts'), 'utf8')
    for (const k of TOKENS) {
      expect(cfg, `brand.tokens must set ${k}`).toMatch(new RegExp(`${k}\\s*:`))
    }
  })
})

describe('@oneie/design preset surface', () => {
  it('createPreset returns the 6-key color map, defaulting from defaultTokens', () => {
    const preset = createPreset()
    expect(Object.keys(preset.colors).sort()).toEqual([...TOKENS].sort())
    expect(preset.colors.primary).toBe(defaultTokens.primary)
  })
  it('createPreset applies overrides', () => {
    const preset = createPreset({ primary: 'hsl(10 50% 50%)' })
    expect(preset.colors.primary).toBe('hsl(10 50% 50%)')
  })
  it('generateThemeCSS emits an @theme block with the 6 tokens', () => {
    const css = generateThemeCSS(defaultTokens)
    expect(css).toContain('@theme')
    expect(css).toContain('--color-primary:')
  })
})

describe('.claude is conventions-only — 0 /do-engine files', () => {
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(join(dir, e.name)) : [e.name],
    )
  it('apps/web/.claude exists', () => {
    expect(existsSync(join(WEB, '.claude'))).toBe(true)
  })
  it('contains no /do-engine command/agent files', () => {
    const forbidden = ['do.md', 'do-auto.sh', 'w1-recon.md', 'w2-decide.md', 'w3-edit.md', 'w4-verify.md']
    const files = walk(join(WEB, '.claude'))
    for (const f of forbidden) {
      expect(files, `.claude must not ship ${f}`).not.toContain(f)
    }
  })
})
