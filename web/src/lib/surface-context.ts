/**
 * Surface context — what is the user looking at right now?
 *
 * ChatDock reads this and ships it as a system signal into the chat stream
 * (so the LLM knows the page, the selection, the brand, and the viewer
 * role without the user retyping it).
 *
 * Wire:
 *   1. Astro page sets `window.__surfaceContext = {...}` in a <script>
 *      block before ChatDock hydrates.
 *   2. `useSurfaceContext()` reads it once on mount, falls back to URL parsing.
 *   3. On every change, `emitClick('ui:dock:context-signal', ctx)` so
 *      telemetry + the substrate bridge can observe.
 *
 * Pure read — never mutates the global. Astro page owns the source of truth.
 */

import { useEffect, useState } from 'react'
import { emitClick } from '@/lib/ui-signal'
import type { Viewer } from '@/lib/viewer'

export type Surface =
  | 'chat'
  | 'agents'
  | 'skills'
  | 'tools'
  | 'payments'
  | 'design'
  | 'settings'

export interface SurfaceContext {
  url: string
  surface: Surface
  selection?: {
    type: 'agent' | 'skill' | 'tool' | 'theme'
    id: string
    name: string
  }
  brand?: {
    workspace: string
    primary?: string
    secondary?: string
  }
  viewer: Viewer
}

declare global {
  interface Window {
    __surfaceContext?: Partial<SurfaceContext>
  }
}

const SURFACES: Surface[] = ['chat', 'agents', 'skills', 'tools', 'payments', 'design', 'settings']

function deriveSurfaceFromUrl(url: string): Surface {
  const path = new URL(url, 'http://x').pathname.split('/').filter(Boolean)
  const head = path[0] ?? ''
  return (SURFACES as string[]).includes(head) ? (head as Surface) : 'chat'
}

function readContext(): SurfaceContext {
  const url = typeof window !== 'undefined' ? window.location.href : ''
  const injected = (typeof window !== 'undefined' && window.__surfaceContext) || {}
  return {
    url,
    surface: injected.surface ?? deriveSurfaceFromUrl(url),
    selection: injected.selection,
    brand: injected.brand,
    viewer: injected.viewer ?? 'end_user',
  }
}

export function useSurfaceContext(): SurfaceContext {
  const [ctx, setCtx] = useState<SurfaceContext>(() => readContext())

  useEffect(() => {
    const next = readContext()
    setCtx(next)
    emitClick('ui:dock:context-signal', next)
  }, [])

  return ctx
}
