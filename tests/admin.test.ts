import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const ADMIN_PKG = join(ROOT, 'packages', 'plugin-admin', 'src')

describe('<AdminPanel> served-tag shape', () => {
  it('AdminPanel.astro mounts <OnePanel plugin="admin">', () => {
    const src = readFileSync(join(ADMIN_PKG, 'AdminPanel.astro'), 'utf8')
    expect(src).toContain('plugin="admin"')
    expect(src).toContain('OnePanel')
  })
  it('AdminPanel.astro ships no admin/CRM source — only the loader re-export', () => {
    const src = readFileSync(join(ADMIN_PKG, 'AdminPanel.astro'), 'utf8')
    expect(src).not.toContain('SubstrateClient')
    expect(src).not.toContain('workspaceContext')
  })
})

describe('adminPanel() paid contract', () => {
  it('tier is paid', async () => {
    const { adminPanel } = await import('../packages/plugin-admin/src/index')
    expect(adminPanel().tier).toBe('paid')
  })
  it('entitlement is admin', async () => {
    const { adminPanel } = await import('../packages/plugin-admin/src/index')
    expect(adminPanel().entitlement).toBe('admin')
  })
  it('serves /x/admin.js', async () => {
    const { adminPanel } = await import('../packages/plugin-admin/src/index')
    expect(adminPanel().serves).toContain('/x/admin.js')
  })
  it('name is plugin-admin', async () => {
    const { adminPanel } = await import('../packages/plugin-admin/src/index')
    expect(adminPanel().name).toBe('plugin-admin')
  })
})

describe('strip guard still holds with plugin-admin present', () => {
  it('scripts/strip-guard.sh exits 0 (no moat source leaked)', () => {
    expect(() =>
      execFileSync('bash', ['scripts/strip-guard.sh'], { cwd: ROOT, stdio: 'pipe' }),
    ).not.toThrow()
  })
})
