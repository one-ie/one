/**
 * Discriminated union for all 13 ONE preview/action cards.
 *
 * Cards are surfaces — minimal data, one primary action. Detail views live
 * in routes; cards link out. Every card calls `onAction(action, payload?)`
 * which the host wraps with `emitClick('ui:<surface>:<action>')`.
 *
 * Locked: 13 card kinds. Adding a 14th requires a spec change (see ui.md).
 */

export type Surface =
  | 'chat'
  | 'agents'
  | 'skills'
  | 'tools'
  | 'payments'
  | 'design'
  | 'settings'

export type CardData =
  | { kind: 'agent-preview'; id: string; name: string; tagline?: string; status: 'draft' | 'live' | 'paused' | 'evolving' }
  | { kind: 'deploy-status'; service: string; state: 'queued' | 'building' | 'live' | 'failed'; ms?: number; url?: string }
  | { kind: 'result'; title: string; ok: boolean; detail?: string; href?: string }
  | { kind: 'choice-chips'; prompt: string; options: { id: string; label: string }[] }
  | { kind: 'verify'; subject: string; checks: { label: string; pass: boolean }[] }
  | { kind: 'price'; label: string; amount: string; currency: 'USD' | 'SUI' | 'ETH' | 'BTC'; cta?: string }
  | { kind: 'brand-palette'; primary: string; secondary: string; tertiary: string }
  | { kind: 'skill-toggle'; id: string; name: string; enabled: boolean; description?: string }
  | { kind: 'marketplace-mini'; agentId: string; name: string; price: string; rating?: number }
  | { kind: 'trace-mini'; signal: string; depth: number; outcome: 'mark' | 'warn' | 'dissolve' | 'timeout' }
  | { kind: 'compare'; a: { label: string; value: string }; b: { label: string; value: string } }
  | { kind: 'onboarding-checklist'; steps: { id: string; label: string; done: boolean }[] }
  | { kind: 'empty-state'; title: string; hint?: string; cta?: { label: string; action: string } }

export interface CardProps {
  data: CardData
  onAction: (action: string, payload?: unknown) => void
  surface: Surface
}
