import { chat } from './llm'
import { loadAgent } from './agent'
import { emit } from './telemetry'
import type { Signal, Env } from './types'

export async function runAgent(
  signal: Signal,
  channel: 'telegram' | 'discord',
  env: Env,
): Promise<string> {
  const agent = loadAgent(env as unknown as Record<string, string | undefined>)
  const start = Date.now()

  try {
    const response = await chat(
      env,
      agent.systemPrompt,
      [{ role: 'user', content: signal.content }],
      agent.model,
    )

    emit(env, agent.id, {
      channel,
      model: agent.model,
      messageLen: signal.content.length,
      responseLen: response.length,
      latencyMs: Date.now() - start,
      success: true,
      sessionId: signal.group,
    })

    return response
  } catch (err) {
    console.error(`${channel} agent error:`, err)
    emit(env, agent.id, {
      channel,
      model: agent.model,
      messageLen: signal.content.length,
      responseLen: 0,
      latencyMs: Date.now() - start,
      success: false,
      error: err instanceof Error ? err.message : String(err),
    })
    return ''
  }
}
