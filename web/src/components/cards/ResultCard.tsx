import { CheckIcon, XIcon } from 'lucide-react'
import { emitClick } from '@/lib/ui-signal'
import type { CardProps } from '@/lib/cards'

type ResultData = Extract<CardProps['data'], { kind: 'result' }>

export function ResultCard({ data, onAction }: CardProps) {
  const d = data as ResultData

  return (
    <article
      className="bg-background border rounded-2xl flex flex-col"
      style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
    >
      <header className="flex items-start justify-between gap-4 px-5 pt-5">
        <h3 className="text-base font-bold text-font">{d.title}</h3>
        {d.ok
          ? <CheckIcon className="size-5 text-tertiary shrink-0" strokeWidth={1.5} />
          : <XIcon className="size-5 text-destructive shrink-0" strokeWidth={1.5} />
        }
      </header>

      {d.detail && (
        <div
          className="mx-5 mt-4 p-4 bg-foreground rounded-xl border"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <p className="text-sm text-font/60">{d.detail}</p>
        </div>
      )}

      {d.href && (
        <footer
          className="flex items-center justify-end gap-3 px-5 py-4 mt-auto border-t"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <button
            className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm"
            onClick={() => {
              emitClick('ui:card:result:view')
              onAction('view', { href: d.href })
            }}
          >
            View
          </button>
        </footer>
      )}
    </article>
  )
}
