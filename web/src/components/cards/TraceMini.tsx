import { emitClick } from '@/lib/ui-signal'
import type { CardProps } from '@/lib/cards'

type TraceMiniData = Extract<CardProps['data'], { kind: 'trace-mini' }>

const outcomeClass: Record<TraceMiniData['outcome'], string> = {
  mark: 'text-tertiary',
  warn: 'text-secondary',
  dissolve: 'text-font/60',
  timeout: 'text-font/40',
}

const outcomeLabel: Record<TraceMiniData['outcome'], string> = {
  mark: 'mark',
  warn: 'warn',
  dissolve: 'dissolve',
  timeout: 'timeout',
}

export function TraceMini({ data }: CardProps) {
  const d = data as TraceMiniData

  return (
    <article
      className="bg-background border rounded-2xl flex flex-col"
      style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
    >
      <header className="flex items-start justify-between gap-4 px-5 pt-5">
        <h3 className="text-base font-bold text-font truncate">{d.signal}</h3>
        <span
          className="px-2.5 py-1 rounded-full text-xs bg-foreground border text-font/60 shrink-0"
          style={{ borderColor: 'var(--color-border)' }}
        >
          depth {d.depth}
        </span>
      </header>

      <div
        className="mx-5 mt-4 mb-5 p-4 bg-foreground rounded-xl border flex items-center gap-2"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <span className="text-xs text-font/60">outcome</span>
        <span
          className={`px-2.5 py-1 rounded-full text-xs bg-background border font-medium ${outcomeClass[d.outcome]}`}
          style={{ borderColor: 'var(--color-border)' }}
        >
          {outcomeLabel[d.outcome]}
        </span>
      </div>
    </article>
  )
}
