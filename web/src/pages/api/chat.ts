import type { APIRoute } from 'astro'
import { createGroq } from '@ai-sdk/groq'
import { createWorkersAI } from 'workers-ai-provider'
import { convertToModelMessages, streamText, tool, type UIMessage } from 'ai'
import { z } from 'zod'
import { getCfCtx, getEnv } from '../../lib/cf-env'
import { makeChallenge } from '../../lib/passkey'
import { listFiles } from '../../lib/slug'
import { runCase, type TestCase } from '../../lib/eval/runner'
import { gradeCase } from '../../lib/eval/grader'
import { aggregate } from '../../lib/eval/aggregate'
import { buildIterationPrompt } from '../../lib/eval/iterate'

export const prerender = false

const SYSTEM = `You are ONE — a helpful, concise assistant for the ONE substrate.
Be direct. Use markdown. When a user asks about ONE, explain that it's a signal-based AI substrate where agents earn paths through verified outcomes.

When tools are independent, call them in parallel.`

const SSE_HEADERS = {
  'X-Accel-Buffering': 'no',
  'Cache-Control': 'no-cache, no-transform',
  'Content-Encoding': 'identity',
}

const STARTER_PROMPTS = new Set([
  'What is ONE?',
  'Show me the signal highways',
  'How do I sell a skill?',
  'How do I buy?',
  'Explain how pheromone routing works',
  'Walk me through a signal step by step',
  'Show a TypeScript ONE signal handler',
  'Show the schema for a path entity',
  'List the agent files in this repo',
  'Where does ONE store knowledge?',
])

type KVLike = {
  get(key: string): Promise<string | null>
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>
}

export const GET: APIRoute = () => new Response(null, { status: 204 })

export const POST: APIRoute = async ({ request }) => {
  const env = (await getEnv()) as unknown as {
    GROQ_API_KEY?: string
    AI?: unknown
    CHAT_CACHE?: KVLike
    SERVER_SECRET?: string
    CONTENT?: R2Bucket
  }
  const groqApiKey = env.GROQ_API_KEY
  if (!groqApiKey) {
    return new Response(JSON.stringify({ error: 'GROQ_API_KEY not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body: { messages?: UIMessage[]; group?: string; slug?: string }
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'invalid json' }), { status: 400 })
  }

  const messages = body.messages ?? []
  if (messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages required' }), { status: 400 })
  }

  const lastText =
    messages
      .at(-1)
      ?.parts?.find((p): p is { type: 'text'; text: string } => p.type === 'text')
      ?.text?.trim() ?? ''

  // T3-P11: KV edge-cache for starter prompts
  const cache = STARTER_PROMPTS.has(lastText) ? env.CHAT_CACHE : undefined
  const cacheKey = cache ? `v1:${lastText}` : null
  if (cache && cacheKey) {
    const cached = await cache.get(cacheKey)
    if (cached) {
      return new Response(cached, {
        headers: { ...SSE_HEADERS, 'Content-Type': 'text/event-stream; charset=utf-8' },
      })
    }
  }

  const slug = body.slug
  let systemSuffix = ''
  if (slug && env.CONTENT) {
    const files = await listFiles(slug, env.CONTENT as R2Bucket)
    if (files.length > 0) systemSuffix = `\n\nExisting files for @${slug}:\n${files.map(f => `- ${f}`).join('\n')}`
  }

  const writeSchema = z.object({
    file: z.string().describe('Relative path like "page/about" or "agents/support"'),
    content: z.string().describe('Full file content (markdown)'),
  })

  const writeTool = slug && env.SERVER_SECRET
    ? {
        write: tool({
          description: "Write or update a file in the owner's space. Returns a pending challenge that must be approved.",
          inputSchema: writeSchema,
          execute: async (args: z.infer<typeof writeSchema>) => {
            const { challenge, token } = await makeChallenge(env.SERVER_SECRET!)
            return { kind: 'pending' as const, challenge, token, file: args.file, preview: args.content.slice(0, 300) }
          },
        }),
      }
    : undefined

  const evalSchema = z.object({
    skillPath: z.string().describe('Relative skill path like "process-refund"'),
    iteration: z.number().optional().describe('Iteration number, defaults to 1'),
  })

  const evalTool = slug && env.CONTENT && groqApiKey
    ? {
        eval: tool({
          description:
            'Run eval suite on a skill: with-skill vs without-skill, write benchmark.json, return delta. skillPath is the skill name only, e.g. "csv-analyzer" — do not include "skills/" prefix.',
          inputSchema: evalSchema,
          execute: async (args: z.infer<typeof evalSchema>) => {
            const skillPath = args.skillPath.replace(/^skills\//, '')
            const iteration = args.iteration ?? 1
            const [skillObj, evalsObj] = await Promise.all([
              (env.CONTENT as R2Bucket).get(`${slug}/skills/${skillPath}.md`),
              (env.CONTENT as R2Bucket).get(`${slug}/skills/${skillPath}/evals/evals.json`),
            ])
            if (!skillObj || !evalsObj)
              return { kind: 'eval-error' as const, error: 'skill or evals.json not found' }
            const [skillMd, evalsJson] = await Promise.all([skillObj.text(), evalsObj.text()])
            let testCases: TestCase[]
            try {
              testCases = JSON.parse(evalsJson)
            } catch {
              return { kind: 'eval-error' as const, error: 'invalid evals.json' }
            }
            const skillName = skillPath.split('/').at(-1) ?? skillPath
            const pairs = await Promise.all(
              testCases.map(async tc => {
                const [withRun, withoutRun] = await Promise.all([
                  runCase(tc, skillMd, groqApiKey),
                  runCase(tc, null, groqApiKey),
                ])
                const [withGrade, withoutGrade] = await Promise.all([
                  gradeCase(tc, withRun, groqApiKey),
                  gradeCase(tc, withoutRun, groqApiKey),
                ])
                return { tc, withRun, withGrade, withoutRun, withoutGrade }
              }),
            )
            const benchmark = aggregate(
              skillName,
              iteration,
              pairs.map(p => ({ run: p.withRun, grade: p.withGrade })),
              pairs.map(p => ({ run: p.withoutRun, grade: p.withoutGrade })),
            )
            await (env.CONTENT as R2Bucket).put(
              `${slug}/skills/_workspace/${skillName}/iteration-${iteration}/benchmark.json`,
              JSON.stringify(benchmark, null, 2),
            )
            const failures = pairs
              .filter(p => p.withGrade.passed < p.withGrade.total)
              .map(p => ({ testCase: p.tc, run: p.withRun, grade: p.withGrade }))
            return {
              kind: 'eval-result' as const,
              benchmark,
              iterationPrompt: failures.length ? buildIterationPrompt(skillMd, failures) : null,
            }
          },
        }),
      }
    : undefined

  const tools = { ...(writeTool ?? {}), ...(evalTool ?? {}) }
  const opts = {
    system: SYSTEM + systemSuffix,
    messages: await convertToModelMessages(messages),
    ...(Object.keys(tools).length > 0 ? { tools } : {}),
  }

  let result
  try {
    const groq = createGroq({ apiKey: groqApiKey })
    result = streamText({ model: groq('llama-3.3-70b-versatile'), ...opts })
  } catch {
    const ai = createWorkersAI({ binding: env.AI })
    result = streamText({ model: ai('@cf/meta/llama-3.3-70b-instruct-fp8-fast'), ...opts })
  }

  const response = result.toUIMessageStreamResponse({ headers: SSE_HEADERS })

  if (cache && cacheKey && response.body) {
    const [body1, body2] = response.body.tee()
    const ctx = await getCfCtx()
    ctx?.waitUntil(
      (async () => {
        const reader = body2.getReader()
        const chunks: Uint8Array[] = []
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          if (value) chunks.push(value)
        }
        const total = chunks.reduce((s, c) => s + c.length, 0)
        const merged = new Uint8Array(total)
        let off = 0
        for (const c of chunks) {
          merged.set(c, off)
          off += c.length
        }
        await cache.put(cacheKey, new TextDecoder().decode(merged), { expirationTtl: 3600 })
      })(),
    )
    return new Response(body1, { headers: response.headers })
  }

  return response
}
