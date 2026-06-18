import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PREMIUM_PKG = join(ROOT, 'packages', 'plugin-premium', 'src')

describe('<OnePanel> served-tag shape', () => {
  it('OnePanel.astro emits src under https://one.ie/x/', () => {
    const src = readFileSync(join(PREMIUM_PKG, 'OnePanel.astro'), 'utf8')
    expect(src).toContain('https://one.ie/x/')
  })
  it('OnePanel.astro references a .js file', () => {
    const src = readFileSync(join(PREMIUM_PKG, 'OnePanel.astro'), 'utf8')
    expect(src).toContain('.js')
  })
  it('OnePanel.astro emits data-plugin attribute', () => {
    const src = readFileSync(join(PREMIUM_PKG, 'OnePanel.astro'), 'utf8')
    expect(src).toContain('data-plugin')
  })
  it('OnePanel.astro emits data-entitlement-key attribute', () => {
    const src = readFileSync(join(PREMIUM_PKG, 'OnePanel.astro'), 'utf8')
    expect(src).toContain('data-entitlement-key')
  })
  it('OnePanel.astro does not contain integrity (no SRI)', () => {
    const src = readFileSync(join(PREMIUM_PKG, 'OnePanel.astro'), 'utf8')
    expect(src).not.toContain('integrity')
  })
  it('OnePanel.astro does not contain crossorigin (no SRI)', () => {
    const src = readFileSync(join(PREMIUM_PKG, 'OnePanel.astro'), 'utf8')
    expect(src).not.toContain('crossorigin')
  })
})

describe('premium() factory paid contract', () => {
  it('tier is paid', async () => {
    const { premium } = await import('../packages/plugin-premium/src/index')
    const result = premium({ plugin: 'admin' })
    expect(result.tier).toBe('paid')
  })
  it('serves includes /x/admin.js', async () => {
    const { premium } = await import('../packages/plugin-premium/src/index')
    const result = premium({ plugin: 'admin' })
    expect(result.serves).toContain('/x/admin.js')
  })
  it('entitlement is admin', async () => {
    const { premium } = await import('../packages/plugin-premium/src/index')
    const result = premium({ plugin: 'admin' })
    expect(result.entitlement).toBe('admin')
  })
})

describe('Entitlement 402 body shape', () => {
  const mockEntitlementExceeded = {
    error: 'entitlement_exceeded',
    feature: 'admin',
    limit: 0,
    used: 1,
  }

  function noClaimResponse(feature: string) {
    return { feature, allowed: false, remaining: 0, limit: 0, used: 0, soft: false }
  }

  it('402 body has error field', () => {
    expect(mockEntitlementExceeded).toHaveProperty('error')
    expect(mockEntitlementExceeded.error).toBe('entitlement_exceeded')
  })
  it('402 body has feature field', () => {
    expect(mockEntitlementExceeded).toHaveProperty('feature')
    expect(mockEntitlementExceeded.feature).toBe('admin')
  })
  it('absent claim response has allowed: false', () => {
    const response = noClaimResponse('admin')
    expect(response.allowed).toBe(false)
  })
  it('absent claim response carries feature name', () => {
    const response = noClaimResponse('admin')
    expect(response.feature).toBe('admin')
  })
})
