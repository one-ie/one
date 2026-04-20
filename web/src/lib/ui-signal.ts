export interface UiClickDetail {
  receiver: string
  payload?: unknown
  ts: number
}

export function emitClick(receiver: string, payload?: unknown): void {
  if (typeof window === "undefined") return
  const detail: UiClickDetail = { receiver, payload, ts: Date.now() }
  window.dispatchEvent(new CustomEvent<UiClickDetail>("ui:click", { detail }))
}
