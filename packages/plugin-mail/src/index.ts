import type { OnePluginFactory } from '@oneie/frontend'

export interface OneMailConfig {
  /** Workspace slug (required) */
  ws: string
  /** Agent slug to handle mail actions (auto-draft, prioritize) */
  agent?: string
  /** Folder list shown in the sidebar */
  folders?: string[]
  /** Layout style — three-pane (folder list + message list + message view) or list only */
  layout?: 'three-pane' | 'list'
  /** Channels worker URL override — defaults to ONE backend */
  channelsUrl?: string
  /** Override the default API endpoint */
  endpoint?: string
}

export const mail: OnePluginFactory<OneMailConfig> = (config = {} as OneMailConfig) => ({
  name: 'plugin-mail',
  tier: 'connected',
  serves: 'https://one.ie/ml/mail.js',
  config: undefined,
  integration: undefined,
  entitlement: undefined,
})

export type { OneMailConfig as MailConfig }
