export interface Signal {
  id: string
  group: string
  channel: 'web' | 'telegram' | 'discord'
  sender: string
  content: string
  ts: number
}

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface CfRateLimiter {
  limit(opts: { key: string }): Promise<{ success: boolean }>
}

export interface Env {
  OPENROUTER_API_KEY: string
  GROQ_API_KEY?: string
  TELEGRAM_TOKEN?: string
  DISCORD_TOKEN?: string
  AGENT_ID: string
  AGENT_MODEL?: string
  AGENT_PROMPT?: string
  ONE_API_URL?: string
  RATE_LIMITER?: CfRateLimiter
}

export interface AgentConfig {
  id: string
  name: string
  model: string
  systemPrompt: string
}
