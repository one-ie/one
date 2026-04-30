/**
 * Claw — edge-native AI agents on Cloudflare Workers.
 *
 * Routes
 *   GET  /health               — status
 *   GET  /highways             — top substrate paths
 *   GET  /messages/:group      — conversation history
 *   POST /message              — direct API: send a message + get a reply
 *   POST /webhook/:channel     — channel webhook (telegram, telegram-<name>, discord)
 */

import { Hono } from 'hono'
import { normalize, send } from './channels'
import { handleExplore, handleForget, handleMemory } from './memory'
import { personas } from './personas'
import { ingest, measureOutcome, recall } from './pipeline'
import { systemPromptWithPack } from './prompt'
import { ensureRegistered, highways, isToxic, mark, warn } from './substrate'
import { executeTool, tools } from './tools'
import type { Env, GroupContext } from './types'

const DEFAULT_MODEL = 'meta-llama/llama-4-maverick'

// ─── LLM provider routing ────────────────────────────────────────────────────

function resolveLLM(model: string, env: Env): { url: string; headers: Record<string, string>; modelId: string } {
  if (model.startsWith('groq/') && env.GROQ_API_KEY) {
    return {
      url: 'https://api.groq.com/openai/v1/chat/completions',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.GROQ_API_KEY}` },
      modelId: model.slice(5),
    }
  }
  return {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://one.ie',
      'X-Title': 'Claw',
    },
    modelId: model,
  }
}

// ─── Group context ───────────────────────────────────────────────────────────

async function loadContext(env: Env, groupId: string): Promise<GroupContext> {
  const cached = (await env.KV.get(`context:${groupId}`, 'json')) as GroupContext | null
  if (cached) return cached

  // Resolve persona: BOT_PERSONA env > group prefix tg-<persona>- > none
  const personaKey = env.BOT_PERSONA ?? Object.keys(personas).find((k) => groupId.startsWith(`tg-${k}-`)) ?? null
  const persona = personaKey ? (personas[personaKey] ?? null) : null

  const ctx: GroupContext = {
    id: groupId,
    systemPrompt: persona?.systemPrompt ?? 'You are a helpful assistant. Be concise and direct.',
    model: persona?.model ?? DEFAULT_MODEL,
    tags: persona?.tags ?? [],
  }

  const row = await env.DB.prepare(`SELECT name, system_prompt, model FROM groups WHERE id = ?`)
    .bind(groupId)
    .first()
    .catch(() => null)

  if (row) {
    ctx.name = row.name as string
    ctx.systemPrompt = (row.system_prompt as string) || ctx.systemPrompt
    ctx.model = (row.model as string) || ctx.model
  }

  await env.KV.put(`context:${groupId}`, JSON.stringify(ctx), { expirationTtl: 300 }).catch(() => {})
  return ctx
}

async function buildMessages(env: Env, groupId: string): Promise<{ role: string; content: string }[]> {
  const rows = await env.DB.prepare(
    `SELECT role, content FROM messages WHERE group_id = ? ORDER BY ts DESC LIMIT 20`,
  )
    .bind(groupId)
    .all()

  return (rows.results || []).reverse().map((r) => ({
    role: r.role as string,
    content: r.content as string,
  }))
}

// ─── App ─────────────────────────────────────────────────────────────────────

const app = new Hono<{ Bindings: Env }>()

// CORS
app.use('*', async (c, next) => {
  c.header('Access-Control-Allow-Origin', '*')
  c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (c.req.method === 'OPTIONS') return new Response(null, { status: 204 })
  return next()
})

// Auth — webhooks + health are public; other routes need API_KEY when set
app.use('*', async (c, next) => {
  const apiKey = c.env.API_KEY
  if (!apiKey) return next()

  const path = new URL(c.req.url).pathname
  if (path === '/health' || path.startsWith('/webhook/')) return next()

  if (c.req.header('Authorization') === `Bearer ${apiKey}`) return next()
  return c.json({ ok: false, error: 'Unauthorized' }, 401)
})

app.get('/health', (c) => c.json({ status: 'ok', version: c.env.VERSION, service: 'claw' }))

app.get('/highways', async (c) => {
  const limit = parseInt(c.req.query('limit') || '10', 10)
  return c.json({ highways: await highways(c.env, limit) })
})

app.get('/messages/:group', async (c) => {
  const group = c.req.param('group')
  const result = await c.env.DB.prepare(
    `SELECT id, sender, content, role, ts FROM messages WHERE group_id = ? ORDER BY ts ASC LIMIT 100`,
  )
    .bind(group)
    .all()
  return c.json({ group, messages: result.results || [] })
})

// Direct API — sync LLM call, returns the reply
app.post('/message', async (c) => {
  try {
    const { group, text, sender = 'user' } = (await c.req.json()) as {
      group: string
      text: string
      sender?: string
    }
    if (!group || !text) return c.json({ ok: false, error: 'group and text required' }, 400)

    const groupUid = `claw:${group}`
    if (await isToxic(c.env, 'entry', groupUid).catch(() => false)) {
      return c.json({ ok: false, dissolved: true, reason: 'toxic' })
    }

    await c.env.DB.prepare(
      `INSERT OR IGNORE INTO groups (id, channel, name, created_at) VALUES (?, 'web', ?, ?)`,
    )
      .bind(group, group, Math.floor(Date.now() / 1000))
      .run()

    const msgId = `web-${Date.now()}`
    await c.env.DB.prepare(
      `INSERT INTO messages (id, group_id, channel, sender, content, role, ts) VALUES (?, ?, 'web', ?, ?, 'user', ?)`,
    )
      .bind(msgId, group, sender, text, Date.now())
      .run()

    const [context, chatMessages] = await Promise.all([loadContext(c.env, group), buildMessages(c.env, group)])

    const llm = resolveLLM(context.model, c.env)
    const openaiTools = tools.map((t) => ({
      type: 'function' as const,
      function: { name: t.name, description: t.description, parameters: t.input_schema },
    }))

    const res = await fetch(llm.url, {
      method: 'POST',
      headers: llm.headers,
      body: JSON.stringify({
        model: llm.modelId,
        max_tokens: 512,
        messages: [{ role: 'system', content: context.systemPrompt }, ...chatMessages],
        tools: openaiTools,
      }),
    })

    if (!res.ok) {
      warn(c.env, 'entry', groupUid, 0.5).catch(() => {})
      return c.json({ ok: false, error: 'LLM request failed' }, 500)
    }

    const data = (await res.json()) as { choices?: [{ message?: { content?: string; tool_calls?: unknown[] } }] }
    const choice = data.choices?.[0]?.message
    const reply = (choice?.content as string) || ''

    if (choice?.tool_calls) {
      for (const call of choice.tool_calls as { function: { name: string; arguments: string } }[]) {
        executeTool(c.env, group, call.function.name, JSON.parse(call.function.arguments)).catch(() => {})
      }
    }

    if (reply) {
      const respId = `resp-${Date.now()}`
      c.env.DB.prepare(
        `INSERT INTO messages (id, group_id, channel, sender, content, role, ts) VALUES (?, ?, 'web', 'assistant', ?, 'assistant', ?)`,
      )
        .bind(respId, group, reply, Date.now())
        .run()
        .catch(() => {})
      mark(c.env, 'entry', groupUid).catch(() => {})
      return c.json({ ok: true, id: msgId, group, response: reply, responseId: respId })
    }

    return c.json({ ok: true, id: msgId, group, response: null })
  } catch (e) {
    console.error('Post message error:', e)
    return c.json({ ok: false, error: String(e) }, 500)
  }
})

// Channel webhooks — Telegram + Discord
app.post('/webhook/:channel', async (c) => {
  try {
    const channel = c.req.param('channel')
    const payload = await c.req.json()

    const signal = normalize(channel, payload)
    if (!signal) return c.json({ ok: false, error: 'Invalid payload' }, 400)

    // Slash commands: /memory, /forget, /forget confirm, /explore
    const cmd = signal.content.trim()
    const isSlash = cmd === '/memory' || cmd.startsWith('/forget') || cmd === '/explore'
    if (isSlash) {
      const { uid } = await ingest(channel, signal.sender, cmd, 'claw', c.env)
      let reply = ''
      if (cmd === '/memory') reply = await handleMemory(uid, signal.sender, signal.group, c.env)
      else if (cmd === '/forget confirm') reply = await handleForget(uid, signal.sender, true, c.env)
      else if (cmd === '/forget') reply = await handleForget(uid, signal.sender, false, c.env)
      else if (cmd === '/explore') reply = await handleExplore(uid, c.env)
      if (reply) await send(c.env, signal.group, reply)
      return c.json({ ok: true, id: signal.id, group: signal.group })
    }

    // Register group as substrate unit (best-effort)
    await ensureRegistered(c.env, signal.group).catch(() => {})

    await c.env.DB.prepare(
      `INSERT OR IGNORE INTO groups (id, channel, name, created_at) VALUES (?, ?, ?, ?)`,
    )
      .bind(signal.group, channel, signal.group, Math.floor(Date.now() / 1000))
      .run()

    await c.env.DB.prepare(
      `INSERT INTO messages (id, group_id, channel, sender, content, role, ts) VALUES (?, ?, ?, ?, ?, 'user', ?)`,
    )
      .bind(signal.id, signal.group, channel, signal.sender, signal.content, signal.ts)
      .run()

    // Memory-enhanced turn: outcome (prev) → ingest → recall → respond
    await measureOutcome(c.env, signal.sender, signal.group, signal.content).catch(() => {})

    const { uid, tags } = await ingest(channel, signal.sender, signal.content, 'claw', c.env)

    await c.env.DB.prepare(`INSERT OR REPLACE INTO turn_meta (group_id, tags, ts) VALUES (?, ?, ?)`)
      .bind(signal.group, tags.join(','), Date.now())
      .run()
      .catch(() => {})

    const [context, pack, chatMessages] = await Promise.all([
      loadContext(c.env, signal.group),
      recall(c.env, signal.group, uid, signal.sender),
      buildMessages(c.env, signal.group),
    ])

    const systemPrompt = systemPromptWithPack(context.systemPrompt, pack)
    const llm = resolveLLM(context.model, c.env)
    const openaiTools = tools.map((t) => ({
      type: 'function' as const,
      function: { name: t.name, description: t.description, parameters: t.input_schema },
    }))

    const res = await fetch(llm.url, {
      method: 'POST',
      headers: llm.headers,
      body: JSON.stringify({
        model: llm.modelId,
        max_tokens: 512,
        messages: [{ role: 'system', content: systemPrompt }, ...chatMessages],
        tools: openaiTools,
      }),
    })

    if (!res.ok) {
      warn(c.env, 'entry', `claw:${signal.group}`, 0.5).catch(() => {})
      return c.json({ ok: false, error: 'LLM request failed' }, 500)
    }

    const data = (await res.json()) as { choices?: [{ message?: { content?: string; tool_calls?: unknown[] } }] }
    const choice = data.choices?.[0]?.message
    const reply = (choice?.content as string) || ''

    if (choice?.tool_calls) {
      for (const call of choice.tool_calls as { function: { name: string; arguments: string } }[]) {
        await executeTool(c.env, signal.group, call.function.name, JSON.parse(call.function.arguments))
      }
    }

    if (reply) {
      await c.env.DB.prepare(
        `INSERT INTO messages (id, group_id, channel, sender, content, role, ts) VALUES (?, ?, ?, 'assistant', ?, 'assistant', ?)`,
      )
        .bind(`resp-${Date.now()}`, signal.group, channel, reply, Date.now())
        .run()
      await send(c.env, signal.group, reply)
      mark(c.env, 'entry', `claw:${signal.group}`).catch(() => {})
    } else {
      warn(c.env, 'entry', `claw:${signal.group}`, 0.5).catch(() => {})
    }

    return c.json({ ok: true, id: signal.id, group: signal.group })
  } catch (e) {
    console.error('Webhook error:', e)
    return c.json({ ok: false, error: String(e) }, 500)
  }
})

export default { fetch: app.fetch }
