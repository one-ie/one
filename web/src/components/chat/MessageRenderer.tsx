/**
 * MessageRenderer — dispatches a ChatFrame to the correct card component.
 *
 * Accepts the two renderable frame kinds (card + chips). Text frames are
 * handled upstream by the AI SDK / MessageList; they never reach here.
 *
 * Card dispatch: switch on data.kind → matching card from cards/.
 * Chips: inline button row; each chip fires emitClick + onAction.
 * Unknown kind: null (silent, no console noise in prod).
 */

import { emitClick } from '@/lib/ui-signal'
import type { CardData, Surface } from '@/lib/cards'
import type { Chip } from '@/lib/chat-frames'

import { AgentPreviewCard } from '@/components/cards/AgentPreviewCard'
import { DeployStatusCard } from '@/components/cards/DeployStatusCard'
import { ResultCard } from '@/components/cards/ResultCard'
import { ChoiceChips } from '@/components/cards/ChoiceChips'
import { VerifyCard } from '@/components/cards/VerifyCard'
import { PriceCard } from '@/components/cards/PriceCard'
import { BrandPalette } from '@/components/cards/BrandPalette'
import { SkillToggleRow } from '@/components/cards/SkillToggleRow'
import { MarketplaceMini } from '@/components/cards/MarketplaceMini'
import { TraceMini } from '@/components/cards/TraceMini'
import { CompareCard } from '@/components/cards/CompareCard'
import { OnboardingChecklist } from '@/components/cards/OnboardingChecklist'
import { EmptyStateCard } from '@/components/cards/EmptyStateCard'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MessageRendererProps {
  frame:
    | { kind: 'card'; data: CardData }
    | { kind: 'chips'; chips: Chip[] }
    | { kind: 'tool-output'; toolName: string; output: unknown }
  surface: Surface
  onAction?: (action: string, payload?: unknown) => void
}

// ---------------------------------------------------------------------------
// Tool-output → CardData mapper
// ---------------------------------------------------------------------------

function toolOutputToCard(toolName: string, output: unknown): CardData | null {
  const o = output as Record<string, unknown>
  switch (toolName) {
    case 'compile':
      if (o.kind === 'compiled')
        return { kind: 'agent-preview', id: String(o.id ?? ''), name: String(o.name ?? 'New agent'), status: 'draft' }
      return null
    case 'emit_card':
      return o as CardData
    default:
      return null
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MessageRenderer({ frame, surface, onAction }: MessageRendererProps) {
  // Stable action handler: emits substrate click then forwards to caller.
  function handleAction(action: string, payload?: unknown) {
    const kind = frame.kind === 'card' ? frame.data.kind : frame.kind === 'tool-output' ? frame.toolName : 'chips'
    emitClick(`ui:card:${kind}:${action}`, payload)
    onAction?.(action, payload)
  }

  // --- tool-output frame — map to card then fall through ---
  if (frame.kind === 'tool-output') {
    const mapped = toolOutputToCard(frame.toolName, frame.output)
    if (!mapped) return null
    return (
      <MessageRenderer
        frame={{ kind: 'card', data: mapped }}
        surface={surface}
        onAction={onAction}
      />
    )
  }

  // --- chips frame ---
  if (frame.kind === 'chips') {
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {frame.chips.map((chip) => (
          <button
            key={chip.id}
            className="px-3 py-1.5 rounded-full text-sm bg-foreground border text-font hover:bg-primary hover:text-on-primary transition-colors"
            style={{ borderColor: 'var(--color-border)' }}
            onClick={() => {
              emitClick(`ui:chat:chip:${chip.id}`)
              onAction?.('chip', chip)
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>
    )
  }

  // --- card frame — dispatch on data.kind ---
  const { data } = frame

  switch (data.kind) {
    case 'agent-preview':
      return (
        <AgentPreviewCard
          data={data as Extract<CardData, { kind: 'agent-preview' }>}
          onAction={handleAction}
          surface={surface}
        />
      )

    case 'deploy-status':
      return (
        <DeployStatusCard
          data={data as Extract<CardData, { kind: 'deploy-status' }>}
          onAction={handleAction}
          surface={surface}
        />
      )

    case 'result':
      return (
        <ResultCard
          data={data as Extract<CardData, { kind: 'result' }>}
          onAction={handleAction}
          surface={surface}
        />
      )

    case 'choice-chips':
      return (
        <ChoiceChips
          data={data as Extract<CardData, { kind: 'choice-chips' }>}
          onAction={handleAction}
          surface={surface}
        />
      )

    case 'verify':
      return (
        <VerifyCard
          data={data as Extract<CardData, { kind: 'verify' }>}
          onAction={handleAction}
          surface={surface}
        />
      )

    case 'price':
      return (
        <PriceCard
          data={data as Extract<CardData, { kind: 'price' }>}
          onAction={handleAction}
          surface={surface}
        />
      )

    case 'brand-palette':
      return (
        <BrandPalette
          data={data as Extract<CardData, { kind: 'brand-palette' }>}
          onAction={handleAction}
          surface={surface}
        />
      )

    case 'skill-toggle':
      return (
        <SkillToggleRow
          data={data as Extract<CardData, { kind: 'skill-toggle' }>}
          onAction={handleAction}
          surface={surface}
        />
      )

    case 'marketplace-mini':
      return (
        <MarketplaceMini
          data={data as Extract<CardData, { kind: 'marketplace-mini' }>}
          onAction={handleAction}
          surface={surface}
        />
      )

    case 'trace-mini':
      return (
        <TraceMini
          data={data as Extract<CardData, { kind: 'trace-mini' }>}
          onAction={handleAction}
          surface={surface}
        />
      )

    case 'compare':
      return (
        <CompareCard
          data={data as Extract<CardData, { kind: 'compare' }>}
          onAction={handleAction}
          surface={surface}
        />
      )

    case 'onboarding-checklist':
      return (
        <OnboardingChecklist
          data={data as Extract<CardData, { kind: 'onboarding-checklist' }>}
          onAction={handleAction}
          surface={surface}
        />
      )

    case 'empty-state':
      return (
        <EmptyStateCard
          data={data as Extract<CardData, { kind: 'empty-state' }>}
          onAction={handleAction}
          surface={surface}
        />
      )

    default:
      // Exhaustiveness: TypeScript narrows `data` to `never` here if all
      // 13 kinds are covered. If a 14th is added without updating this
      // switch, it silently returns null until the spec change lands.
      return null
  }
}
