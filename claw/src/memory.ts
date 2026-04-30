/**
 * /memory, /forget, /explore — user-facing memory commands.
 * Used in webhook handler when text starts with one of these slash-words.
 */

import { actorHighways, query, recallHypotheses } from './substrate'
import type { Env } from './types'

const FORGET_TTL = 300 // 5 minutes

export async function handleMemory(actorUid: string, handle: string, groupId: string, env: Env): Promise<string> {
  const [hypotheses, paths] = await Promise.all([
    recallHypotheses(env, actorUid).catch(() => []),
    actorHighways(env, actorUid, 5).catch(() => []),
  ])

  const countRow = await env.DB.prepare(`SELECT COUNT(*) as cnt FROM messages WHERE group_id = ?`)
    .bind(groupId)
    .first()
    .catch(() => null)
  const msgCount = (countRow?.cnt as number) || 0

  const lines: string[] = [`Memory for ${handle} (${msgCount} messages)`]

  if (hypotheses.length === 0 && paths.length === 0) {
    lines.push('\nNothing learned yet. Chat more to build a profile!')
    return lines.join('\n')
  }

  const confident = hypotheses.filter((h) => h.confidence >= 0.85)
  if (confident.length > 0) {
    lines.push('\nWhat I know:')
    for (const h of confident) {
      lines.push(`  [${h.status}] ${h.statement} (${Math.round(h.confidence * 100)}%)`)
    }
  }

  const hints = hypotheses.filter((h) => h.confidence >= 0.5 && h.confidence < 0.85)
  if (hints.length > 0) {
    lines.push('\nWhat I think (less certain):')
    for (const h of hints) {
      lines.push(`  possibly: ${h.statement} (${Math.round(h.confidence * 100)}%)`)
    }
  }

  if (paths.length > 0) {
    lines.push('\nTop interests:')
    for (const hw of paths) {
      lines.push(`  ${hw.to} (strength: ${hw.strength.toFixed(1)})`)
    }
  }

  lines.push('\n/forget to erase  /explore to discover new topics')
  return lines.join('\n')
}

export async function handleForget(actorUid: string, handle: string, isConfirm: boolean, env: Env): Promise<string> {
  const pendingKey = `forget_pending:${actorUid}`

  if (!isConfirm) {
    await env.KV.put(pendingKey, '1', { expirationTtl: FORGET_TTL })
    return (
      `Erase all memory for ${handle}?\n\n` +
      `This will delete your paths, hypotheses, and profile from the substrate. ` +
      `This cannot be undone.\n\n` +
      `Send /forget confirm within 5 minutes to proceed, or do nothing to cancel.`
    )
  }

  const pending = await env.KV.get(pendingKey)
  if (!pending) return 'Confirmation expired. Send /forget to start over.'

  await env.KV.delete(pendingKey)

  const safe = actorUid.replace(/"/g, '')
  await query(
    env,
    `match $u isa unit, has uid "${safe}"; $p (source: $u) isa path; delete $p isa path;`,
    true,
  ).catch(() => {})
  await query(
    env,
    `match $u isa unit, has uid "${safe}"; $p (target: $u) isa path; delete $p isa path;`,
    true,
  ).catch(() => {})
  await query(
    env,
    `match $h isa hypothesis, has subject "${safe}"; delete $h isa hypothesis;`,
    true,
  ).catch(() => {})

  await env.DB.prepare(`DELETE FROM messages WHERE group_id LIKE ?`)
    .bind(`conv:${safe}:%`)
    .run()
    .catch(() => {})

  return `Memory erased for ${handle}. Paths, hypotheses, and conversation history have been removed.`
}

const TAG_QUESTIONS: Record<string, string> = {
  code: 'Want to explore code? I can help with TypeScript, debugging, or architecture.',
  marketing: 'Interested in marketing? I can help with campaigns, copy, and brand strategy.',
  writing: 'Want to work on writing? Blog posts, headlines, copy — I can help draft and refine.',
  research: 'Need research help? I can dig into topics, summarize, and synthesize findings.',
  deploy: 'Curious about deployment? I can walk through Cloudflare Workers, CI/CD, and infra.',
  design: 'Want design input? I can help with UI patterns, color systems, and component structure.',
  substrate: "Want to explore the substrate? Agents, signals, pheromone routing — it's all learnable.",
  typescript: 'Want TypeScript help? Type inference, generics, config — name the challenge.',
  strategy: 'Thinking about strategy? I can help map goals, roadmaps, and decision frameworks.',
}

const DEFAULT_QUESTIONS = [
  'What kind of work are you focused on right now?',
  "Any challenges you're trying to solve that we haven't tackled together yet?",
  'Want to try something new — code, writing, strategy, or something else?',
]

export async function handleExplore(actorUid: string, env: Env): Promise<string> {
  const touched = await actorHighways(env, actorUid, 50)
    .then((hw) => new Set(hw.map((h) => h.to)))
    .catch(() => new Set<string>())

  const worldTagRows = await query(env, `match $s isa skill, has tag $t; select $t;`).catch(() => [] as unknown[])
  const worldTags = new Set(worldTagRows.map((r) => (r as { t: string }).t).filter(Boolean))
  const frontier = [...worldTags].filter((t) => !touched.has(t))

  const questions: string[] = []
  for (const tag of frontier) {
    if (TAG_QUESTIONS[tag]) questions.push(TAG_QUESTIONS[tag])
    if (questions.length >= 3) break
  }
  while (questions.length < 3) {
    const def = DEFAULT_QUESTIONS[questions.length]
    if (def) questions.push(def)
    else break
  }

  return `Here are some directions we haven't explored together yet:\n\n${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
}
