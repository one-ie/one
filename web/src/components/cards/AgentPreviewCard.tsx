import { emitClick } from '@/lib/ui-signal'
import type { CardProps } from '@/lib/cards'

type AgentPreviewData = Extract<CardProps['data'], { kind: 'agent-preview' }>

const statusClass: Record<AgentPreviewData['status'], string> = {
  draft: 'text-font/60',
  live: 'text-tertiary',
  paused: 'text-secondary',
  evolving: 'text-primary',
}

const statusLabel: Record<AgentPreviewData['status'], string> = {
  draft: 'Draft',
  live: 'Live',
  paused: 'Paused',
  evolving: 'Evolving',
}

export function AgentPreviewCard({ data, onAction }: CardProps) {
  const d = data as AgentPreviewData

  return (
    <article
      className="bg-background border rounded-2xl flex flex-col"
      style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
    >
      <header className="flex items-start justify-between gap-4 px-5 pt-5">
        <h3 className="text-base font-bold text-font">{d.name}</h3>
        <span
          className={`px-2.5 py-1 rounded-full text-xs bg-foreground border ${statusClass[d.status]}`}
          style={{ borderColor: 'var(--color-border)' }}
        >
          {statusLabel[d.status]}
        </span>
      </header>

      {d.tagline && (
        <div
          className="mx-5 mt-4 p-4 bg-foreground rounded-xl border"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <p className="text-sm text-font/60">{d.tagline}</p>
        </div>
      )}

      <footer
        className="flex items-center justify-end gap-3 px-5 py-4 mt-auto border-t"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <button
          className="px-4 py-2 rounded-lg text-font text-sm"
          onClick={() => {
            emitClick('ui:card:agent-preview:open')
            onAction('open', { id: d.id })
          }}
        >
          Open
        </button>
        <button
          className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm"
          onClick={() => {
            emitClick('ui:card:agent-preview:deploy')
            onAction('deploy', { id: d.id })
          }}
        >
          Deploy
        </button>
      </footer>
    </article>
  )
}
