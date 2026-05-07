/**
 * Chat stream frame protocol (M11).
 *
 * Cards travel as AI-SDK tool results, not a separate channel. The model calls
 * `emit_card` / `emit_chips`; the tool returns a frame; MessageList renders by
 * `output.kind`. Reuses AI SDK's UIMessage stream — no NDJSON, no second
 * EventSource, no custom transport.
 *
 * Three frame kinds:
 *   - text   — normal streamed assistant text (handled by AI SDK directly)
 *   - card   — one of 13 cards from cards.ts (kind+data discriminated)
 *   - chips  — trailing intent chips (1-4) shown after the reply
 *
 * Adding a 4th frame requires a spec change.
 */

import type { CardData } from './cards'

export interface Chip {
  id: string         // receiver suffix → emitClick(`ui:chat:starter:${id}`)
  label: string
  receiver?: string  // override; defaults to `ui:chat:starter:${id}`
}

export type ChatFrame =
  | { kind: 'text'; text: string }
  | { kind: 'card'; data: CardData }
  | { kind: 'chips'; chips: Chip[] }

/** Tool-result shape for `emit_card` — what the model's tool returns. */
export interface CardFrame {
  kind: 'card'
  data: CardData
}

/** Tool-result shape for `emit_chips` — trailing chips frame. */
export interface ChipsFrame {
  kind: 'chips'
  chips: Chip[]
}

export const CHAT_FRAME_KINDS = ['text', 'card', 'chips'] as const
