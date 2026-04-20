import type { AgentConfig } from './types'

const DEFAULT_PROMPT = `You are a helpful assistant for ONE — the signal-based substrate for AI agents.

ONE helps people:
- Deploy AI agents to web, Telegram, and Discord
- Connect agents to the substrate for pheromone learning
- Buy and sell capabilities in the marketplace

Keep responses short (2-3 sentences). Be friendly and helpful.
If someone asks what ONE does, lead with the benefit, not the architecture.`

export function loadAgent(env: Record<string, string | undefined>): AgentConfig {
  return {
    id: env.AGENT_ID ?? 'one-demo',
    name: env.AGENT_NAME ?? 'ONE Demo',
    model: env.AGENT_MODEL ?? 'meta-llama/llama-4-maverick',
    systemPrompt: env.AGENT_PROMPT ?? DEFAULT_PROMPT,
  }
}
