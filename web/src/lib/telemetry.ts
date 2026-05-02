import type { Env } from './types'

const DEFAULT_BASE = 'https://dev.one.ie'

export interface TelemetryEvent {
  channel: 'web' | 'telegram' | 'discord'
  model: string
  messageLen: number
  responseLen: number
  latencyMs: number
  success: boolean
  error?: string
  // Optional caller-provided session — webhook handlers pass `signal.group`
  // (the chat thread). Web pulls from a client-supplied header or cookie.
  // Falls back to a per-call random — correct, just not groupable.
  sessionId?: string
}

export function emit(env: Env, agentId: string, event: TelemetryEvent): void {
  if ((env as unknown as { ONEIE_TELEMETRY_DISABLE?: string }).ONEIE_TELEMETRY_DISABLE) return
  const base = env.ONE_API_URL ?? DEFAULT_BASE
  const endpoint = `${base.replace(/\/$/, '')}/api/signal`
  const session = event.sessionId ?? crypto.randomUUID().slice(0, 16)

  void fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: `template:${agentId}:${session}`,
      receiver: `template:${agentId}:${event.channel}`,
      data: JSON.stringify({
        tags: [
          'telemetry',
          'template',
          event.channel,
          event.model,
          event.success ? 'ok' : 'error',
        ],
        weight: event.success ? 1 : 0.5,
        content: {
          session,
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
