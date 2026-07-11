// Ported verbatim from one.ie/web/src/lib/ui-signal.ts — window-only CustomEvent
// dispatch, zero substrate coupling, safe on any external site.
export function emitClick(receiver: string, payload?: unknown): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('ui:click', { detail: { receiver, payload } }))
}
