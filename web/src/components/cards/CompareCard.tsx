import type { CardProps } from '@/lib/cards'

type CompareData = Extract<CardProps['data'], { kind: 'compare' }>

export function CompareCard({ data }: CardProps) {
  const d = data as CompareData

  return (
    <article
      className="bg-background border rounded-2xl flex flex-col"
      style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
    >
      <header className="px-5 pt-5">
        <h3 className="text-base font-bold text-font">Compare</h3>
      </header>

      <div className="mx-5 mt-4 mb-5 grid grid-cols-2 gap-3">
        <div
          className="bg-foreground rounded-xl border p-3 flex flex-col gap-1"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <span className="text-xs text-font/60">{d.a.label}</span>
          <span className="text-lg font-bold text-font">{d.a.value}</span>
        </div>
        <div
          className="bg-foreground rounded-xl border p-3 flex flex-col gap-1"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <span className="text-xs text-font/60">{d.b.label}</span>
          <span className="text-lg font-bold text-font">{d.b.value}</span>
        </div>
      </div>
    </article>
  )
}
