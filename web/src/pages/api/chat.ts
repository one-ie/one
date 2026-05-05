import type { APIRoute } from 'astro'
import { createGroq } from '@ai-sdk/groq'
import { createWorkersAI } from 'workers-ai-provider'
import { convertToModelMessages, streamText, tool, type UIMessage } from 'ai'
import { z } from 'zod'
import { getCfCtx, getEnv } from '../../lib/cf-env'
import { makeChallenge } from '../../lib/passkey'
import { listFiles } from '../../lib/slug'
import { compile, type CompileTarget } from '../../lib/compile'
import { verifyReceipt } from '../../lib/x402'
import { runCase, type TestCase } from '../../lib/eval/runner'
import { gradeCase } from '../../lib/eval/grader'
import { aggregate } from '../../lib/eval/aggregate'
import { buildIterationPrompt } from '../../lib/eval/iterate'

export const prerender = false

function buildSystem(slug?: string, displayName?: string): string {
  if (!slug) return `You are ONE — a helpful, concise assistant.\nBe direct. Use markdown.\nWhen tools are independent, call them in parallel.`
  const name = displayName ? `${displayName} (@${slug})` : `@${slug}`
  return `You are the AI assistant for ${name}'s site on ONE.\nHelp them build and manage their website, pages, blog posts, and AI agents. Be direct and practical.\nWhen tools are independent, call them in parallel.`
}

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

export const GET: APIRoute = async ({ url }) => {
  const slug = url.searchParams.get('slug')
  if (!slug) return new Response(null, { status: 204 })
  const env = (await getEnv()) as unknown as { CONTENT?: R2Bucket }
  const files = env.CONTENT ? await listFiles(slug, env.CONTENT as R2Bucket) : []
  const starters = files.length > 0
    ? ['Update my homepage', 'Add a blog post', 'Improve my support agent', 'Check my settings']
    : ['Create my homepage', 'Write an about page', 'Add a pricing page', 'Create an AI agent']
  return new Response(JSON.stringify({ starters }), { headers: { 'Content-Type': 'application/json' } })
}

export const POST: APIRoute = async ({ request }) => {
  const env = (await getEnv()) as unknown as {
    GROQ_API_KEY?: string
    AI?: unknown
    CHAT_CACHE?: KVLike
    SERVER_SECRET?: string
    CONTENT?: R2Bucket
    DB?: D1Database
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
  let ownerDisplayName: string | undefined
  if (slug && env.CONTENT) {
    const files = await listFiles(slug, env.CONTENT as R2Bucket)
    if (files.length > 0) systemSuffix = `\n\nExisting files for @${slug}:\n${files.map(f => `- ${f}`).join('\n')}`
  }
  if (slug && env.DB) {
    const row = await env.DB.prepare('SELECT display_name FROM owners WHERE slug = ?').bind(slug).first<{ display_name?: string | null }>()
    ownerDisplayName = row?.display_name ?? undefined
  }

  const writeSchema = z.object({
    file: z.string().describe('Relative path like "page/about" or "agents/support"'),
    content: z.string().nullable().describe('Full file content (markdown). Set content to null to delete the file.'),
  })

  const writeTool = slug && env.SERVER_SECRET
    ? {
        write: tool({
          description: "Write or update a file in the owner's space. Returns a pending challenge that must be approved.",
          inputSchema: writeSchema,
          execute: async (args: z.infer<typeof writeSchema>) => {
            const { challenge, token } = await makeChallenge(env.SERVER_SECRET!)
            return { kind: 'pending' as const, challenge, token, file: args.file, preview: args.content?.slice(0, 300) ?? '' }
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

  function parseSkillPrice(md: string): number {
    const m = /^price:\s*([\d.]+)/m.exec(md)
    return m ? parseFloat(m[1]) : 0
  }

  const skillTool = slug && env.CONTENT
    ? {
        skill: tool({
          description: 'Execute a skill by name from this site. If the skill has a price, returns a payment request first.',
          inputSchema: z.object({ name: z.string().describe('Skill name, e.g. "csv-analyzer"') }),
          execute: async ({ name }: { name: string }) => {
            const skillName = name.replace(/^skills\//, '')
            const obj = await (env.CONTENT as R2Bucket).get(`${slug}/skills/${skillName}.md`)
            if (!obj) return { kind: 'error' as const, error: 'skill not found' }
            const md = await obj.text()
            const price = parseSkillPrice(md)
            if (price > 0) return { kind: 'pending-payment' as const, skill: skillName, price }
            return { kind: 'skill-content' as const, content: md }
          },
        }),
      }
    : undefined

  const paymentTool = slug && env.CONTENT && env.CHAT_CACHE
    ? {
        payment: tool({
          description: 'Verify a payment receipt and unlock a paid skill.',
          inputSchema: z.object({
            skill: z.string().describe('Skill name, e.g. "csv-analyzer"'),
            receipt: z.string().describe('Transaction hash from the payment'),
            amount: z.number().describe('Amount paid'),
          }),
          execute: async ({ skill: skillName, receipt, amount }: { skill: string; receipt: string; amount: number }) => {
            const name = skillName.replace(/^skills\//, '')
            const obj = await (env.CONTENT as R2Bucket).get(`${slug}/skills/${name}.md`)
            if (!obj) return { kind: 'payment-rejected' as const, reason: 'skill not found' }
            const md = await obj.text()
            const expectedAmount = parseSkillPrice(md)
            const v = await verifyReceipt({ receipt, amount, expectedAmount, slug: slug!, kv: env.CHAT_CACHE })
            if (!v.ok) return { kind: 'payment-rejected' as const, reason: v.reason }
            return { kind: 'skill-result' as const, content: md }
          },
        }),
      }
    : undefined

  const compileTool = slug && env.CONTENT
    ? {
        compile: tool({
          description: 'Compile an agent to Python, MCP, or skill.md format. Read-only — no approval required.',
          inputSchema: z.object({
            agent: z.string().describe('Agent file name, e.g. "support"'),
            target: z.enum(['python', 'mcp', 'skill']).describe('Output format'),
          }),
          execute: async ({ agent, target }: { agent: string; target: CompileTarget }) => {
            const obj = await (env.CONTENT as R2Bucket).get(`${slug}/agents/${agent}.md`)
            if (!obj) return { kind: 'error' as const, error: 'agent not found' }
            const md = await obj.text()
            return { kind: 'compiled' as const, target, content: compile(md, target) }
          },
        }),
      }
    : undefined

  const tools = { ...(writeTool ?? {}), ...(evalTool ?? {}), ...(skillTool ?? {}), ...(compileTool ?? {}), ...(paymentTool ?? {}) }
  const opts = {
    system: buildSystem(slug, ownerDisplayName) + systemSuffix,
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
