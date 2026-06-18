// plugin-admin — first paid plugin (C5). A thin composer over plugin-premium:
// the Admin Console UI is SERVED from one.ie/x/admin.js and gated by the
// 'admin' entitlement. No admin/CRM source ships here — only the loader call.
import { premium } from '@oneie/plugin-premium'
import type { OnePlugin } from '@oneie/frontend'

export interface AdminPanelConfig {
  entitlementKey?: string
  ws?: string
  primary?: string
}

/** adminPanel() — the Admin Console paid plugin. Fixes plugin:'admin' so the
 *  served path is /x/admin.js and the entitlement claim is 'admin'. */
export function adminPanel(_config: Partial<AdminPanelConfig> = {}): OnePlugin {
  const base = premium({ plugin: 'admin' })
  return {
    name: 'plugin-admin',
    tier: base.tier,
    serves: base.serves,
    entitlement: base.entitlement,
  }
}

export type { AdminPanelConfig as AdminConfig }
