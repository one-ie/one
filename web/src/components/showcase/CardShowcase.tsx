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

const noop = () => {}

export function CardShowcase() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <AgentPreviewCard
        data={{ kind: 'agent-preview', id: '1', name: 'Refunds Bot', tagline: 'Handle refund requests', status: 'live' }}
        onAction={noop}
        surface="design"
      />
      <DeployStatusCard
        data={{ kind: 'deploy-status', service: 'refunds-bot', state: 'live', ms: 1200, url: 'https://example.com' }}
        onAction={noop}
        surface="design"
      />
      <ResultCard
        data={{ kind: 'result', title: 'Agent deployed', ok: true, detail: '3 checks passed' }}
        onAction={noop}
        surface="design"
      />
      <ChoiceChips
        data={{ kind: 'choice-chips', prompt: 'What would you like to do?', options: [{ id: 'a', label: 'Deploy' }, { id: 'b', label: 'Edit' }, { id: 'c', label: 'Delete' }] }}
        onAction={noop}
        surface="design"
      />
      <VerifyCard
        data={{ kind: 'verify', subject: 'System prompt', checks: [{ label: 'Has name', pass: true }, { label: 'Has prompt', pass: true }, { label: '>20 words', pass: false }] }}
        onAction={noop}
        surface="design"
      />
      <PriceCard
        data={{ kind: 'price', label: 'Monthly plan', amount: '9.99', currency: 'USD', cta: 'Subscribe' }}
        onAction={noop}
        surface="design"
      />
      <BrandPalette
        data={{ kind: 'brand-palette', primary: 'hsl(216 55% 65%)', secondary: 'hsl(219 14% 65%)', tertiary: 'hsl(105 22% 65%)' }}
        onAction={noop}
        surface="design"
      />
      <SkillToggleRow
        data={{ kind: 'skill-toggle', id: 's1', name: 'Stripe Payments', enabled: true, description: 'Accept credit cards' }}
        onAction={noop}
        surface="design"
      />
      <MarketplaceMini
        data={{ kind: 'marketplace-mini', agentId: 'm1', name: 'Support Bot', price: '$5/mo', rating: 4 }}
        onAction={noop}
        surface="design"
      />
      <TraceMini
        data={{ kind: 'trace-mini', signal: 'ui:chat:send', depth: 3, outcome: 'mark' }}
        onAction={noop}
        surface="design"
      />
      <CompareCard
        data={{ kind: 'compare', a: { label: 'Before', value: '$240/mo' }, b: { label: 'After', value: '$120/mo' } }}
        onAction={noop}
        surface="design"
      />
      <OnboardingChecklist
        data={{ kind: 'onboarding-checklist', steps: [{ id: '1', label: 'Create agent', done: true }, { id: '2', label: 'Deploy', done: false }, { id: '3', label: 'Set price', done: false }] }}
        onAction={noop}
        surface="design"
      />
      <EmptyStateCard
        data={{ kind: 'empty-state', title: 'No agents yet', hint: 'Create your first agent to get started', cta: { label: 'Create agent', action: 'create' } }}
        onAction={noop}
        surface="design"
      />
    </div>
  )
}
