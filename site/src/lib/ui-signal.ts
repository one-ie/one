/**
 * UI click signal — dispatches a CustomEvent on window.
 * In ONE-connected mode these events feed the tracking pixel.
 * In standalone mode this is a no-op observable for telemetry hooks.
 *
 * Signature MUST match `one.ie/web/src/lib/ui-signal.ts` and
 * `packages/plugin-pages/src/lib/ui-signal.ts`. This copy used to be
 * `(surface, action, detail?)` and emitted `{ surface, action, ...detail }`,
 * while the ONLY consumer of `ui:click` — `one.ie/web/src/lib/ui-click-funnel.ts`
 * — reads `detail.receiver` / `detail.payload`. Nothing read `surface`/`action`,
 * so a template site that ever wired the tracker would have recorded
 * `receiver: undefined` for every click. Receiver strings are `ui:<surface>:<action>`.
 */
export function emitClick(receiver: string, payload?: unknown): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('ui:click', { detail: { receiver, payload } }))
}
