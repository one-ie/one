// plugin-dashboard — analytics, entity tables, and revenue charts served from
// one.ie/x/dashboard.js via x402, gated by the 'dashboard' entitlement.
// The UI source never ships to the user's repo — only this loader call does.
import type { OnePluginFactory } from '@oneie/frontend'

export type DashboardSection = 'stats' | 'revenue' | 'activity' | 'entities' | 'traffic'

export interface OneDashboardConfig {
  /** Workspace slug (required — all queries scope to this workspace) */
  ws: string
  /** Which panels to show. Defaults to all five when omitted. */
  sections?: DashboardSection[]
  /** Date window for charts and metrics. Default '30d'. */
  dateRange?: '7d' | '30d' | '90d' | '1y'
  /** Colour scheme. Default 'system'. */
  theme?: 'light' | 'dark' | 'system'
  /** Override the ONE API endpoint (useful for self-hosted). */
  endpoint?: string
}

/** dashboard() — the Dashboard paid plugin. Fixes serves to /x/dashboard.js
 *  and the entitlement claim to 'dashboard'. */
export const dashboard: OnePluginFactory<OneDashboardConfig> = (_config = {} as OneDashboardConfig) => ({
  name: 'plugin-dashboard',
  tier: 'paid',
  serves: 'https://one.ie/x/dashboard.js',
  entitlement: 'dashboard',
  config: undefined,
  integration: undefined,
})

export type { OneDashboardConfig as DashboardConfig }
