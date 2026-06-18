/**
 * embed-bridge — the ONLY cross-origin surface between the host page's loader
 * (public/c/chat.js, parent side) and the embedded chat iframe (/embed/[agent]).
 *
 * One typed, versioned, origin-checked envelope. No ad-hoc messages cross. The
 * loader inlines a minimal mirror of this check (it ships as a static classic
 * script and cannot import TS at runtime); the embed route's bundled script and
 * the test import this module directly so the contract has one typed home.
 */
export const ENVELOPE_SOURCE = 'one-chat' as const
export const ENVELOPE_VERSION = 1 as const

export type BridgeType =
  | 'ready' // iframe → parent: booted, ready for config
  | 'config' // parent → iframe: greeting, view, ws, visitorId
  | 'resize' // iframe → parent: content height (mobile full-screen toggle)
  | 'open' // either way: drive / reflect launcher state
  | 'close'
  | 'event' // iframe → parent: re-emit one:chat-* for host analytics
  | 'navigate' // iframe → parent: open external link in the top window

export interface BridgeMessage<P = unknown> {
  source: typeof ENVELOPE_SOURCE
  v: typeof ENVELOPE_VERSION
  type: BridgeType
  payload?: P
}

export function makeMessage<P>(type: BridgeType, payload?: P): BridgeMessage<P> {
  return { source: ENVELOPE_SOURCE, v: ENVELOPE_VERSION, type, payload }
}

export function isBridgeMessage(data: unknown): data is BridgeMessage {
  if (!data || typeof data !== 'object') return false
  const m = data as Record<string, unknown>
  return m.source === ENVELOPE_SOURCE && m.v === ENVELOPE_VERSION && typeof m.type === 'string'
}

/**
 * Origin allowlist check. `'*'` in the list allows any origin — the v1 public
 * embed default (spec D6); C3 narrows it to a per-workspace D1 domain list.
 */
export function isAllowedOrigin(origin: string, allow: readonly string[]): boolean {
  return allow.includes('*') || allow.includes(origin)
}

export interface BridgeHandlerOpts {
  allow: readonly string[]
  onMessage: (msg: BridgeMessage, ev: MessageEvent) => void
}

/** Attach a guarded `message` listener — drops anything off-origin or off-envelope. Returns an unsubscribe. */
export function listen(target: Window, opts: BridgeHandlerOpts): () => void {
  const handler = (ev: MessageEvent) => {
    if (!isAllowedOrigin(ev.origin, opts.allow)) return
    if (!isBridgeMessage(ev.data)) return
    opts.onMessage(ev.data, ev)
  }
  target.addEventListener('message', handler)
  return () => target.removeEventListener('message', handler)
}

/** Post a typed envelope to a target window at an exact origin. */
export function post(target: Window, origin: string, type: BridgeType, payload?: unknown): void {
  target.postMessage(makeMessage(type, payload), origin)
}

/**
 * CSP `frame-ancestors` value for the /embed route (C3 — spec D6 v2). Narrows
 * the v1-open default to a per-workspace allowlist: when a workspace has
 * configured embed domains (D1 `domains` rows), ONLY those origins may frame
 * it — an origin absent from the list is excluded. With no configured domains,
 * public agents stay open (`*`). Server-only (no DOM); the route imports it.
 */
export function buildFrameAncestors(hosts: readonly string[]): string {
  const cleaned = hosts.map((h) => h.trim()).filter(Boolean)
  if (cleaned.length === 0) return 'frame-ancestors *'
  const origins = cleaned.map((h) => (/^https?:\/\//.test(h) ? h : `https://${h}`))
  return `frame-ancestors 'self' ${origins.join(' ')}`
}
