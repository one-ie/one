import { Toaster } from 'sonner'

// Global toast overlay — mounted once in Layout.astro via client:idle.
// Keeps Layout.astro lean; all per-page Toasters (e.g. Inbox) are redundant
// but harmless — Sonner deduplicates by position.
export function GlobalToaster() {
  return <Toaster richColors closeButton position="top-right" />
}
