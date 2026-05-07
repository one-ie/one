import { Check } from 'lucide-react'
import { emitClick } from '@/lib/ui-signal'
import type { CardProps } from '@/lib/cards'

type OnboardingChecklistData = Extract<CardProps['data'], { kind: 'onboarding-checklist' }>

export function OnboardingChecklist({ data, onAction }: CardProps) {
  const d = data as OnboardingChecklistData
  const total = d.steps.length
  const done = d.steps.filter(s => s.done).length

  return (
    <article
      className="bg-background border rounded-2xl flex flex-col"
      style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
    >
      <header className="flex items-start justify-between gap-4 px-5 pt-5">
        <h3 className="text-base font-bold text-font">Get started</h3>
        <span
          className="px-2.5 py-1 rounded-full text-xs bg-foreground border text-font/60 shrink-0"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {done}/{total}
        </span>
      </header>

      <div
        className="mx-5 mt-4 bg-foreground rounded-xl border overflow-hidden"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <ul className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
          {d.steps.map(step => (
            <li key={step.id}>
              <button
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-background/50 transition-colors"
                onClick={() => {
                  emitClick('ui:card:onboarding-checklist:step')
                  onAction('step', { id: step.id })
                }}
              >
                <span
                  className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center ${
                    step.done
                      ? 'bg-primary border-primary'
                      : 'bg-background'
                  }`}
                  style={step.done ? undefined : { borderColor: 'var(--color-border)' }}
                >
                  {step.done && <Check size={12} strokeWidth={2.5} className="text-on-primary" />}
                </span>
                <span
                  className={`text-sm ${
                    step.done ? 'text-font/60 line-through' : 'text-font'
                  }`}
                >
                  {step.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-5 mt-3 mb-5">
        <div className="bg-foreground rounded-full h-1.5" style={{ borderColor: 'var(--color-border)' }}>
          <div
            className="bg-primary rounded-full h-1.5 transition-all"
            style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
          />
        </div>
      </div>
    </article>
  )
}
