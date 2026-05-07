import type { APIRoute } from 'astro'
import { getAgent } from '@/lib/db/agents'
import { getEnv } from '@/lib/cf-env'

export const prerender = false

function unauthorized(): Response {
  return Response.json({ error: 'unauthorized' }, { status: 401 })
}

function checkAuth(request: Request, secret: string): boolean {
  const auth = request.headers.get('Authorization') ?? ''
  const match = auth.match(/^Bearer\s+(.+)$/)
  if (!match) return false
  if (match[1] === secret) return true
  const sep = match[1].indexOf(':')
  if (sep > 0) return match[1].slice(sep + 1) === secret
  return false
}

/**
 * Minimal YAML line parser — handles simple scalar and list values.
 * Lists must appear as repeated `key: value` lines or `key: [a, b, c]`.
 */
function parseFm(yaml: string): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const line of yaml.split('\n')) {
    const m = line.match(/^(\w[\w_-]*):\s*(.+)$/)
    if (m) out[m[1]] = m[2].trim()
  }
  return out
}

interface EvalFail {
  ok: false
  reason: string
  failingCheck: 1 | 2 | 3
  hint: string
}

interface EvalPass {
  ok: true
}

function runEval(name: string, frontmatter: string): EvalFail | EvalPass {
  const fm = parseFm(frontmatter)

  // Check 1 — has a name and non-empty system_prompt
  const systemPrompt = typeof fm['system_prompt'] === 'string' ? fm['system_prompt'].trim() : ''
  if (!name.trim() || !systemPrompt) {
    return {
      ok: false,
      reason: 'Agent must have a name and a system_prompt',
      failingCheck: 1,
      hint: 'Add a non-empty system_prompt field to the agent frontmatter',
    }
  }

  // Check 2 — has at least one capability or skill
  const capabilities = fm['capabilities'] ?? fm['skills']
  const hasCapabilities =
    (typeof capabilities === 'string' && capabilities.trim().length > 0)
  if (!hasCapabilities) {
    return {
      ok: false,
      reason: 'Agent must declare at least one capability or skill',
      failingCheck: 2,
      hint: 'Add a capabilities or skills field to the agent frontmatter',
    }
  }

  // Check 3 — system_prompt is >20 words
  const wordCount = systemPrompt.split(/\s+/).filter(Boolean).length
  if (wordCount <= 20) {
    return {
      ok: false,
      reason: `system_prompt is too short (${wordCount} words; minimum is 21)`,
      failingCheck: 3,
      hint: 'Expand the system_prompt to describe the agent purpose in at least 21 words',
    }
  }

  return { ok: true }
}

export const POST: APIRoute = async ({ params, request }) => {
  const { id } = params
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  const env = await getEnv() as unknown as { DB: D1Database; SERVER_SECRET: string; ONE_API_URL?: string }
  const { DB, SERVER_SECRET } = env
  if (!DB || !SERVER_SECRET) return Response.json({ error: 'not configured' }, { status: 503 })
  if (!checkAuth(request, SERVER_SECRET)) return unauthorized()

  const agent = await getAgent(DB, id)
  if (!agent) return Response.json({ error: 'not found' }, { status: 404 })

  // --- State machine transitions ---

  const url = new URL(request.url)
  const action = url.searchParams.get('action') ?? 'deploy'
  const now = Date.now()

  if (action === 'pause') {
    // live → paused
    if (agent.state !== 'live') {
      return Response.json({ ok: false, error: 'agent is not live' }, { status: 409 })
    }
    await DB.prepare('UPDATE agents SET state = ?, updated_at = ? WHERE id = ?')
      .bind('paused', now, id)
      .run()
    return Response.json({ ok: true, state: 'paused' })
  }

  if (action === 'undeploy') {
    // live → draft
    if (agent.state !== 'live') {
      return Response.json({ ok: false, error: 'agent is not live' }, { status: 409 })
    }
    await DB.prepare('UPDATE agents SET state = ?, updated_at = ? WHERE id = ?')
      .bind('draft', now, id)
      .run()
    return Response.json({ ok: true, state: 'draft' })
  }

  // live → evolving: managed by the L5 runtime loop; not a client-initiated transition
  if (action === 'evolve') {
    return Response.json(
      { ok: false, error: 'evolving state is set by the L5 runtime loop, not the deploy endpoint' },
      { status: 400 },
    )
  }

  // Default: deploy (draft → live)
  if (agent.state !== 'draft') {
    return Response.json(
      { ok: false, error: `cannot deploy from state '${agent.state}'; agent must be in draft` },
      { status: 409 },
    )
  }

  // --- 3-prompt eval gate ---
  const evalResult = runEval(agent.name, agent.frontmatter ?? '')
  if (!evalResult.ok) {
    return Response.json(evalResult, { status: 422 })
  }

  // All checks passed — flip to live
  await DB.prepare('UPDATE agents SET state = ?, updated_at = ? WHERE id = ?')
    .bind('live', now, id)
    .run()

  // Fire-and-forget substrate signal
  fetch(`${env.ONE_API_URL ?? 'https://api.one.ie'}/api/signal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receiver: 'agent:deployed', data: { id, name: agent.name } }),
  }).catch(() => {})

  return Response.json({ ok: true, state: 'live' })
}
