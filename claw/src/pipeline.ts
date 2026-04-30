/**
 * Per-message pipeline: ingest → recall → outcome.
 *
 * - ingest:    resolve actor uid + classify tags
 * - recall:    pull conversation history, actor highways, hypotheses → ContextPack
 * - outcome:   measure valence of incoming message vs last bot reply → mark/warn
 */

import { classify, detectValence } from './classify'
import { actorHighways, mark, recallHypotheses, warn } from './substrate'
import type { Env } from './types'

export interface ContextPack {
  profile: { uid: string; handle: string; messageCount: number }
  hypotheses: { statement: string; status: string; confidence: number }[]
  highways: { to: string; strength: number }[]
  recent: { role: string; content: string }[]
  tools: string[]
}

export interface IngestResult {
  uid: string
  group: string
  tags: string[]
}

/** Resolve a stable actor uid. Override by writing to `identity_links` if you need cross-channel identity. */
async function resolveActor(channel: string, sender: string, env: Env): Promise<string> {
  const row = await env.DB.prepare(
    `SELECT canonical_uid FROM identity_links WHERE channel = ? AND sender_id = ? LIMIT 1`,
  )
    .bind(channel, sender)
    .first<{ canonical_uid: string }>()
    .catch(() => null)
  return row?.canonical_uid || `${channel}:${sender}`
}

export async function ingest(channel: string, sender: string, text: string, bot: string, env: Env): Promise<IngestResult> {
  const uid = await resolveActor(channel, sender, env)
  const group = `conv:${uid}:${bot}`
  const tags = classify(text)
  return { uid, group, tags }
}

export async function recall(env: Env, groupId: string, actorUid: string, handle: string): Promise<ContextPack> {
  const episodic = (): Promise<{ role: string; content: string }[]> =>
    Promise.resolve()
      .then(() =>
        env.DB.prepare(`SELECT role, content FROM messages WHERE group_id = ? ORDER BY ts DESC LIMIT 20`)
          .bind(groupId)
          .all(),
      )
      .then((r) =>
        (r.results || []).reverse().map((row) => ({ role: row.role as string, content: row.content as string })),
      )
      .catch(() => [])

  const [recentRows, paths, hypotheses] = await Promise.all([
    episodic(),
    actorHighways(env, actorUid, 10).catch(() => [] as { to: string; strength: number }[]),
    recallHypotheses(env, actorUid).catch(() => [] as { statement: string; status: string; confidence: number }[]),
  ])

  const messageCount = await Promise.resolve()
    .then(() => env.DB.prepare(`SELECT COUNT(*) as cnt FROM messages WHERE group_id = ?`).bind(groupId).first())
    .then((r) => (r?.cnt as number) || 0)
    .catch(() => 0)

  return {
    profile: { uid: actorUid, handle, messageCount },
    hypotheses,
    highways: paths,
    recent: recentRows,
    tools: [],
  }
}

/**
 * Measure valence of incoming message vs last bot reply, deposit pheromone on tags.
 * positive (>0.3) → mark each tag from previous turn
 * negative (<-0.3) → warn each tag from previous turn
 */
export async function measureOutcome(
  env: Env,
  actorUid: string,
  groupId: string,
  newMessageContent: string,
): Promise<void> {
  const lastBot = await env.DB.prepare(
    `SELECT content FROM messages WHERE group_id = ? AND role = 'assistant' ORDER BY ts DESC LIMIT 1`,
  )
    .bind(groupId)
    .first()
    .catch(() => null)

  if (!lastBot) return

  const lastTags = await env.DB.prepare(`SELECT tags FROM turn_meta WHERE group_id = ? ORDER BY ts DESC LIMIT 1`)
    .bind(groupId)
    .first()
    .catch(() => null)

  if (!lastTags?.tags) return

  const tags = (lastTags.tags as string).split(',').filter(Boolean)
  if (tags.length === 0) return

  const valence = detectValence(newMessageContent)

  if (valence > 0.3) {
    await Promise.all(tags.map((tag) => mark(env, actorUid, tag, valence).catch(() => {})))
  } else if (valence < -0.3) {
    await Promise.all(tags.map((tag) => warn(env, actorUid, tag, Math.abs(valence)).catch(() => {})))
  }
}
