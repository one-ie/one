import type { Env, Message } from './types'

const DEFAULT_MODEL = 'meta-llama/llama-4-maverick'

function resolveTarget(env: Env, model: string | undefined) {
  const modelId = model ?? env.AGENT_MODEL ?? DEFAULT_MODEL
  const isGroq = modelId.startsWith('groq/') && !!env.GROQ_API_KEY
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
  return { url, headers, model: isGroq ? modelId.slice(5) : modelId }
}

export async function chat(
  env: Env,
  systemPrompt: string,
  messages: Message[],
  model?: string
): Promise<string> {
  const { url, headers, model: m } = resolveTarget(env, model)
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: m,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  })
  if (!res.ok) throw new Error(`LLM error: ${await res.text()}`)
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  return data.choices?.[0]?.message?.content ?? ''
}

export async function* chatStream(
  env: Env,
  systemPrompt: string,
  messages: Message[],
  model?: string
): AsyncGenerator<string, void, void> {
  const { url, headers, model: m } = resolveTarget(env, model)
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: m,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 1024,
      temperature: 0.7,
      stream: true,
    }),
  })
  if (!res.ok || !res.body) throw new Error(`LLM error: ${await res.text()}`)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })

    let nl: number
    while ((nl = buf.indexOf('\n')) !== -1) {
      const line = buf.slice(0, nl).trim()
      buf = buf.slice(nl + 1)
      if (!line.startsWith('data:')) continue
      const payload = line.slice(5).trim()
      if (payload === '[DONE]') return
      try {
        const chunk = JSON.parse(payload) as {
          choices?: { delta?: { content?: string } }[]
        }
        const delta = chunk.choices?.[0]?.delta?.content
        if (delta) yield delta
      } catch {
        // skip malformed SSE chunks (keep-alive, partial JSON)
      }
    }
  }
}
