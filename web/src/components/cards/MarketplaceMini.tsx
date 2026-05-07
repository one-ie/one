import { Star } from 'lucide-react'
import { emitClick } from '@/lib/ui-signal'
import type { CardProps } from '@/lib/cards'

type MarketplaceMiniData = Extract<CardProps['data'], { kind: 'marketplace-mini' }>

export function MarketplaceMini({ data, onAction }: CardProps) {
  const d = data as MarketplaceMiniData
  const ratingValue = d.rating ?? 0
  const clampedRating = Math.min(5, Math.max(0, Math.round(ratingValue)))

  return (
    <article
      className="bg-background border rounded-2xl flex flex-col"
      style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
    >
      <header className="flex items-start justify-between gap-4 px-5 pt-5">
        <h3 className="text-base font-bold text-font">{d.name}</h3>
        <span className="text-sm font-medium text-font/60 shrink-0">{d.price}</span>
      </header>

      {d.rating !== undefined && (
        <div
          className="mx-5 mt-4 p-4 bg-foreground rounded-xl border"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                size={16}
                strokeWidth={1.5}
                className={i < clampedRating ? 'text-primary' : 'text-font/40'}
                fill={i < clampedRating ? 'currentColor' : 'none'}
              />
            ))}
          </div>
        </div>
      )}

      <footer
        className="flex items-center justify-end gap-3 px-5 py-4 mt-auto border-t"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <button
          className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm"
          onClick={() => {
            emitClick('ui:card:marketplace-mini:get')
            onAction('get', { agentId: d.agentId, price: d.price })
          }}
        >
          Get
        </button>
      </footer>
    </article>
  )
}
