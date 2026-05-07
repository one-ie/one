import type { CardProps } from '@/lib/cards'
import { emitClick } from '@/lib/ui-signal'

type ChoiceChipsData = Extract<CardProps['data'], { kind: 'choice-chips' }>

export function ChoiceChips({ data, onAction }: CardProps) {
  const { prompt, options } = data as ChoiceChipsData

  return (
    <article
      className="bg-background border rounded-2xl flex flex-col"
      style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
    >
      <header className="px-5 pt-5 pb-4">
        <p className="text-sm text-font">{prompt}</p>
      </header>

      <div className="px-5 pb-5 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            className="px-3 py-1.5 rounded-full text-sm bg-foreground border text-font hover:bg-primary hover:text-on-primary transition-colors"
            style={{ borderColor: 'var(--color-border)' }}
            onClick={() => {
              emitClick('ui:card:choice-chips:select')
              onAction('select', { id: option.id, label: option.label })
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </article>
  )
}
