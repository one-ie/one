/**
 * Trailing-chip system rule + server-side extractor (W6D3).
 *
 * `TRAILING_CHIPS_RULE` is injected into every chat completion so the model
 * declares the user's likely next 1-4 intents. The server strips the block
 * from streamed text and emits it as a `chips` frame. If missing, the server
 * falls back to `computeStarters(ctx)` from `./starters`.
 */

import type { Chip } from './chat-frames'

export type { Chip }

/**
 * System prompt rule injected into every chat completion. The model declares
 * the user's likely next 1-4 intents; server strips the block from text and
 * emits as a `chips` frame. If missing, the server falls back to
 * `computeStarters(ctx)`.
 */
export const TRAILING_CHIPS_RULE = `Every reply MUST end with a trailing_chips JSON block in this exact format:

<chips>[{"id":"<short-id>","label":"<2-5 words>"},...]</chips>

Rules:
- 1 to 4 chips, no more.
- "id" is kebab-case, stable across replies (e.g. "add-blog", "check-deploy").
- "label" is the imperative phrasing of the user's likely next ask (2-5 words).
- Place the block on its own line at the very end of the message, after any other content.
- These chips become clickable receivers (ui:chat:starter:<id>) that route through the substrate.
- Never skip the block. Never wrap it in code fences. Never add commentary after it.`

/**
 * Strip the trailing <chips>[...]</chips> block from streamed text and
 * return cleaned text + parsed chips. Tolerant: if the block is malformed
 * or missing, returns text unchanged and chips=[]; caller falls back to
 * computeStarters(ctx).
 */
export function extractChips(text: string): { text: string; chips: Chip[] } {
  const re = /\s*<chips>([\s\S]*?)<\/chips>\s*$/i
  const match = text.match(re)
  if (!match) return { text, chips: [] }

  let parsed: unknown
  try {
    parsed = JSON.parse(match[1].trim())
  } catch {
    return { text, chips: [] }
  }
  if (!Array.isArray(parsed)) return { text, chips: [] }

  const chips: Chip[] = []
  for (const raw of parsed) {
    if (!raw || typeof raw !== 'object') continue
    const r = raw as { id?: unknown; label?: unknown }
    if (typeof r.id !== 'string' || typeof r.label !== 'string') continue
    if (!r.id || !r.label) continue
    chips.push({ id: r.id, label: r.label, receiver: `ui:chat:starter:${r.id}` })
    if (chips.length === 4) break
  }

  return { text: text.slice(0, match.index).trimEnd(), chips }
}
