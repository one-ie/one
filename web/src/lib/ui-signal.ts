/**
 * Every UI click is a signal. Receivers shaped `ui:<surface>:<action>`.
 * See .claude/rules/ui.md.
 *
 * Dispatches a CustomEvent on window — anything (telemetry, devtools,
 * substrate bridge) can subscribe without coupling the components.
 */
export function emitClick(receiver: string, payload?: unknown): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('ui:click', { detail: { receiver, payload } }))
}
