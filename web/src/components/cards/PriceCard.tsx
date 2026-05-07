import type { CardProps } from '@/lib/cards'
import { emitClick } from '@/lib/ui-signal'

type PriceData = Extract<CardProps['data'], { kind: 'price' }>

export function PriceCard({ data, onAction }: CardProps) {
  const { label, amount, currency, cta } = data as PriceData

  return (
    <article
      className="bg-background border rounded-2xl flex flex-col"
      style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
    >
      <header className="px-5 pt-5 pb-4">
        <h3 className="text-base font-bold text-font">{label}</h3>
      </header>

      <div className="mx-5 p-4 bg-foreground rounded-xl border flex items-baseline gap-3" style={{ borderColor: 'var(--color-border)' }}>
        <span className="text-3xl font-bold text-font">{amount}</span>
        <span className="px-2 py-0.5 rounded-full text-xs bg-foreground border text-font/60" style={{ borderColor: 'var(--color-border)' }}>
          {currency}
        </span>
      </div>

      {cta && (
        <footer
          className="flex items-center justify-end px-5 py-4 mt-4 border-t"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <button
            className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium hover:brightness-110 transition-filter"
            onClick={() => {
              emitClick('ui:card:price:pay')
              onAction('pay', { amount, currency })
            }}
          >
            {cta}
          </button>
        </footer>
      )}
    </article>
  )
}
