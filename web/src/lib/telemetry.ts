import type { Env } from './types'

const DEFAULT_BASE = 'https://dev.one.ie'
const sessionId = crypto.randomUUID().slice(0, 16)

export type Outcome = 'result' | 'warn' | 'dissolve'

export interface TelemetryEvent {
  channel: 'web' | 'telegram' | 'discord'
  model: string
  messageLen: number
  responseLen: number
  latencyMs: number
  success: boolean
  error?: string
  outcome?: Outcome
}

const WEIGHT: Record<Outcome, number> = {
  result: 1,
  warn: 0.5,
  dissolve: 0.3,
}

export function emit(env: Env, agentId: string, event: TelemetryEvent): void {
  if ((env as unknown as { ONEIE_TELEMETRY_DISABLE?: string }).ONEIE_TELEMETRY_DISABLE) return
  const base = env.ONE_API_URL ?? DEFAULT_BASE
  const endpoint = `${base.replace(/\/$/, '')}/api/signal`
  const outcome: Outcome = event.outcome ?? (event.success ? 'result' : 'warn')

  void fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: `template:${agentId}:${sessionId}`,
      receiver: `template:${agentId}:${event.channel}`,
      data: JSON.stringify({
        tags: ['telemetry', 'template', event.channel, event.model, outcome],
        weight: WEIGHT[outcome],
        content: {
          session: sessionId,
          model: event.model,
          messageLen: event.messageLen,
          responseLen: event.responseLen,
          latencyMs: event.latencyMs,
          error: event.error?.slice(0, 200),
        },
      }),
    }),
  }).catch(() => undefined)
}
