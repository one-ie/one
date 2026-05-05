import { Check, Users, Zap, type LucideIcon } from 'lucide-react'
import { Icon } from '@/components/ui/Icon'
import { IconBadge } from '@/components/ui/IconBadge'
import { emitClick } from '@/lib/ui-signal'

type Tone = 'primary' | 'secondary' | 'tertiary'

export const PLANS = [
  { id: 'pro',  name: 'Pro',  amountCents: 2900, period: '/mo',
    icon: Zap as LucideIcon, tone: 'primary' as Tone,
    features: ['Unlimited messages', 'Telegram + Discord', 'Priority support'] },
  { id: 'team', name: 'Team', amountCents: 9900, period: '/mo',
    icon: Users as LucideIcon, tone: 'tertiary' as Tone, highlight: true,
    features: ['Everything in Pro', '5 seats', 'Shared memory', 'Custom branding'] },
] as const
export type PlanId = typeof PLANS[number]['id']

interface Props { selected?: PlanId; onSelect: (id: PlanId, amountCents: number) => void }

export function PriceCards({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
      {PLANS.map((p) => {
        const active = selected === p.id
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => { emitClick('ui:pay:plan', { planId: p.id, amount: p.amountCents }); onSelect(p.id, p.amountCents) }}
            className="relative text-left bg-background rounded-2xl p-5 border transition hover:-translate-y-0.5"
            style={{
              borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
              boxShadow: active ? 'var(--shadow-pop)' : 'var(--shadow-card)',
              transitionDuration: 'var(--ease, 120ms)',
            }}
          >
            {active && (
              <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary text-on-primary inline-flex items-center justify-center">
                <Icon icon={Check} size="sm" />
              </span>
            )}
            <div className="flex items-center gap-3">
              <IconBadge icon={p.icon} tone={p.tone} size="md" />
              <h3 className="text-base font-bold">{p.name}</h3>
              {'highlight' in p && p.highlight && <span className="ml-auto text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/15 text-primary">Popular</span>}
            </div>
            <p className="mt-4">
              <span className="text-3xl font-bold tracking-tight">${(p.amountCents/100).toFixed(0)}</span>
              <span className="text-font/60 text-sm ml-1">{p.period}</span>
            </p>
            <ul className="mt-4 space-y-1.5">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-font/60">
                  <Icon icon={Check} size="sm" />{f}
                </li>
              ))}
            </ul>
          </button>
        )
      })}
    </div>
  )
}
