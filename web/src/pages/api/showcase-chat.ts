import type { APIRoute } from 'astro'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from 'ai'
import { z } from 'zod'
import { getEnv } from '../../lib/cf-env'

export const prerender = false

const SYSTEM = `You are ONE — a helpful, concise assistant.
Be direct. Use markdown.

When the user provides a URL and asks to extract anything (products, prices, links, text), call the crawl tool.
When the user asks you to plan, design, build, or break down a task, call the plan tool first to outline steps before answering.
Call independent tools in parallel.`

const SSE_HEADERS = {
  'X-Accel-Buffering': 'no',
  'Cache-Control': 'no-cache, no-transform',
  'Content-Encoding': 'identity',
}

const DEFAULT_MODEL = 'deepseek/deepseek-r1'

async function crawlUrl(
  accountId: string,
  email: string,
  globalApiKey: string,
  url: string,
  limit: number,
  depth: number,
): Promise<string> {
  const base = `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/crawl`
  const headers = {
    'X-Auth-Email': email,
    'X-Auth-Key': globalApiKey,
    'Content-Type': 'application/json',
  }
  const init = await fetch(base, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      url,
      limit,
      depth: Math.max(1, depth),
      formats: ['markdown'],
      render: true,
      crawlPurposes: ['ai-input'],
    }),
  })
  if (!init.ok) return `Crawl failed to start: ${init.status} ${await init.text()}`
  const { result: jobId } = (await init.json()) as { result: string }
  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 1500))
    const poll = await fetch(`${base}/${jobId}?limit=100`, { headers })
    if (!poll.ok) return `Crawl poll failed: ${poll.status}`
    const { result } = (await poll.json()) as {
      result: { status: string; records?: { url: string; markdown?: string }[] }
    }
    if (result.status === 'completed' || (result.records?.length ?? 0) > 0) {
      const pages = result.records ?? []
      return `Crawled: ${url}\nPages: ${pages.length}\n\n---\n\n${pages
        .map((p) => `### ${p.url}\n\n${p.markdown ?? ''}`)
        .join('\n\n---\n\n')
        .slice(0, 8000)}`
    }
    if (
      ['errored', 'cancelled_due_to_timeout', 'cancelled_due_to_limits', 'cancelled_by_user'].includes(
        result.status,
      )
    ) {
      return `Crawl ended with status: ${result.status}`
    }
  }
  return `Crawl timed out after 30s for ${url}`
}

export const GET: APIRoute = () => new Response(null, { status: 204 })

export const POST: APIRoute = async ({ request }) => {
  const env = (await getEnv()) as unknown as {
    OPENROUTER_API_KEY?: string
    CLOUDFLARE_ACCOUNT_ID?: string
    CLOUDFLARE_EMAIL?: string
    CLOUDFLARE_GLOBAL_API_KEY?: string
  }

  if (!env.OPENROUTER_API_KEY) {
    return new Response(JSON.stringify({ error: 'OPENROUTER_API_KEY not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body: { messages?: UIMessage[]; model?: string }
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'invalid json' }), { status: 400 })
  }

  const messages = body.messages ?? []
  if (messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages required' }), { status: 400 })
  }

  const modelId = body.model || DEFAULT_MODEL

  const cfAccountId = env.CLOUDFLARE_ACCOUNT_ID
  const cfEmail = env.CLOUDFLARE_EMAIL
  const cfGlobalKey = env.CLOUDFLARE_GLOBAL_API_KEY

  const crawlSchema = z.object({
    url: z.string().url().describe('The URL to crawl'),
    intent: z.string().describe('What to extract'),
    limit: z.number().int().min(1).max(10).default(1),
    depth: z.number().int().min(0).max(2).default(0),
  })

  const planSchema = z.object({
    title: z.string().describe('Short title for the plan'),
    description: z.string().describe('One-sentence summary of the goal'),
    steps: z
      .array(
        z.object({
          title: z.string(),
          detail: z.string().optional(),
        }),
      )
      .min(2)
      .max(8)
      .describe('Ordered steps to reach the goal'),
  })

  const planTool = tool({
    description:
      'Outline a multi-step plan before answering a complex request. Returns the plan to display to the user.',
    inputSchema: planSchema,
    execute: async (args: z.infer<typeof planSchema>) => args,
  })

  const crawlTool =
    cfAccountId && cfEmail && cfGlobalKey
      ? tool({
          description:
            'Fetch a URL with Cloudflare Browser Rendering and return its content as markdown. Use when the user provides a URL.',
          inputSchema: crawlSchema,
          execute: async (args: z.infer<typeof crawlSchema>) =>
            crawlUrl(
              cfAccountId,
              cfEmail,
              cfGlobalKey,
              args.url,
              args.limit ?? 1,
              args.depth ?? 0,
            ),
        })
      : undefined

  const tools = { plan: planTool, ...(crawlTool ? { crawl: crawlTool } : {}) }

  const openrouter = createOpenAICompatible({
    name: 'openrouter',
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: env.OPENROUTER_API_KEY,
    headers: {
      'HTTP-Referer': 'https://one.ie',
      'X-Title': 'ONE-Showcase',
    },
  })

  const result = streamText({
    model: openrouter(modelId),
    system: SYSTEM,
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(5),
    providerOptions: {
      // OpenRouter: enable streaming reasoning where the model supports it.
      // Non-reasoning models silently ignore this.
      openrouter: { reasoning: { effort: 'medium' }, include_reasoning: true },
    },
  })

  return result.toUIMessageStreamResponse({ headers: SSE_HEADERS, sendReasoning: true })
}
