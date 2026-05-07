import { emitClick } from '@/lib/ui-signal'
import type { CardProps } from '@/lib/cards'

type EmptyStateData = Extract<CardProps['data'], { kind: 'empty-state' }>

export function EmptyStateCard({ data, onAction }: CardProps) {
  const d = data as EmptyStateData

  return (
    <article
      className="bg-background border rounded-2xl flex flex-col"
      style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <p className="text-font font-semibold">{d.title}</p>
        {d.hint && <p className="text-font/60 text-sm">{d.hint}</p>}
        {d.cta && (
          <button
            className="mt-1 px-4 py-2 rounded-lg bg-primary text-on-primary text-sm"
            onClick={() => {
              emitClick('ui:card:empty-state:cta')
              onAction(d.cta!.action)
            }}
          >
            {d.cta.label}
          </button>
        )}
      </div>
    </article>
  )
}
