import type { OnePluginFactory } from '@oneie/frontend'

export interface OneChatConfig {
  agent?: string
  view?: 'icon' | 'half' | 'full'
  position?: 'left' | 'right'
  primary?: string
  ws?: string
  greeting?: string
}

export const chat: OnePluginFactory<OneChatConfig> = (config = {}) => ({
  name: 'plugin-chat',
  tier: 'connected',
  serves: 'c/chat.js',
  config: undefined,
  integration: undefined,
  entitlement: undefined,
})

export type { OneChatConfig as ChatConfig }
