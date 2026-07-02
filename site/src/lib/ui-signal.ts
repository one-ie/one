/**
 * UI click signal — dispatches a CustomEvent on window.
 * In ONE-connected mode these events feed the tracking pixel.
 * In standalone mode this is a no-op observable for telemetry hooks.
 */
export function emitClick(surface: string, action: string, detail?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent('ui:click', { detail: { surface, action, ...detail } })
  )
}
