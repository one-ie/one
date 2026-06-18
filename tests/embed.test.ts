import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CHAT_PKG = join(ROOT, 'packages', 'plugin-chat', 'src')
const TRACK_PKG = join(ROOT, 'packages', 'plugin-track', 'src')

const FORBIDDEN = ['addEventListener', 'iframe', 'sendBeacon', 'postMessage']

describe('OneChat emits the exact c/chat.js tag', () => {
  it('OneChat.astro emits src="https://one.ie/c/chat.js"', () => {
    const src = readFileSync(join(CHAT_PKG, 'OneChat.astro'), 'utf8')
    expect(src).toContain('https://one.ie/c/chat.js')
  })
  it('OneChat.astro maps all data-* attributes', () => {
    const src = readFileSync(join(CHAT_PKG, 'OneChat.astro'), 'utf8')
    expect(src).toContain('data-agent')
    expect(src).toContain('data-view')
    expect(src).toContain('data-position')
    expect(src).toContain('data-ws')
    expect(src).toContain('data-greeting')
  })
  it('plugin-chat contains no engine source', () => {
    const src = readFileSync(join(CHAT_PKG, 'OneChat.astro'), 'utf8') +
                readFileSync(join(CHAT_PKG, 'index.ts'), 'utf8')
    for (const token of FORBIDDEN) {
      expect(src, `plugin-chat must not contain "${token}"`).not.toContain(token)
    }
  })
})

describe('OneTrack emits the exact p/one.js tag', () => {
  it('OneTrack.astro emits src="https://one.ie/p/one.js"', () => {
    const src = readFileSync(join(TRACK_PKG, 'OneTrack.astro'), 'utf8')
    expect(src).toContain('https://one.ie/p/one.js')
  })
  it('OneTrack.astro maps data-ws and data-agent', () => {
    const src = readFileSync(join(TRACK_PKG, 'OneTrack.astro'), 'utf8')
    expect(src).toContain('data-ws')
    expect(src).toContain('data-agent')
  })
  it('plugin-track contains no engine source', () => {
    const src = readFileSync(join(TRACK_PKG, 'OneTrack.astro'), 'utf8') +
                readFileSync(join(TRACK_PKG, 'index.ts'), 'utf8')
    for (const token of FORBIDDEN) {
      expect(src, `plugin-track must not contain "${token}"`).not.toContain(token)
    }
  })
})

describe('plugin-backend uses lazy SDK import', () => {
  it('does not bare-import @oneie/sdk at module top-level', () => {
    const src = readFileSync(
      join(ROOT, 'packages', 'plugin-backend', 'src', 'index.ts'),
      'utf8',
    )
    expect(src).not.toMatch(/^import.*@oneie\/sdk['"]/m)
    expect(src).toContain("import('@oneie/sdk/client')")
  })
})
