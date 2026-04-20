import type { Env, Message } from './types'

const DEFAULT_MODEL = 'meta-llama/llama-4-maverick'

export async function chat(
  env: Env,
  systemPrompt: string,
  messages: Message[],
  model?: string
): Promise<string> {
  const modelId = model ?? env.AGENT_MODEL ?? DEFAULT_MODEL

  const isGroq = modelId.startsWith('groq/') && env.GROQ_API_KEY
  const url = isGroq
    ? 'https://api.groq.com/openai/v1/chat/completions'
    : 'https://openrouter.ai/api/v1/chat/completions'

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${isGroq ? env.GROQ_API_KEY : env.OPENROUTER_API_KEY}`,
  }

  if (!isGroq) {
    headers['HTTP-Referer'] = 'https://one.ie'
    headers['X-Title'] = 'ONE-Demo'
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: isGroq ? modelId.slice(5) : modelId,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  })

  if (!res.ok) throw new Error(`LLM error: ${await res.text()}`)

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  return data.choices?.[0]?.message?.content ?? ''
}
