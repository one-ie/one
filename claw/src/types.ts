/**
 * Claw — types
 */

export interface CallOptions {
  group: string
  channel: 'web' | 'telegram' | 'discord' | 'api'
  userId?: string
}

export interface Env {
  DB: D1Database
  KV: KVNamespace
  AGENT_QUEUE?: Queue
  GATEWAY_URL: string
  OPENROUTER_API_KEY: string
  GROQ_API_KEY?: string
  TELEGRAM_TOKEN?: string
  DISCORD_TOKEN?: string
  VERSION: string
  /** Worker-level persona key — picks a personas[<key>] entry as the default for all groups. */
  BOT_PERSONA?: string
  /** If set, all non-webhook routes require Authorization: Bearer <API_KEY>. */
  API_KEY?: string
  /** Set to 'development' to enable AI SDK devtools middleware. */
  MODE?: string
}

export interface Signal {
  id: string
  group: string
  channel: string
  sender: string
  content: string
  replyTo?: string
  ts: number
}

export interface GroupContext {
  id: string
  name?: string
  systemPrompt: string
  model: string
  tags?: string[]
}
