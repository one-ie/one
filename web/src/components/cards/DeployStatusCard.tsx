import { CheckIcon, XIcon } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { emitClick } from '@/lib/ui-signal'
import type { CardProps } from '@/lib/cards'

type DeployStatusData = Extract<CardProps['data'], { kind: 'deploy-status' }>

const stateLabel: Record<DeployStatusData['state'], string> = {
  queued: 'Queued',
  building: 'Building',
  live: 'Live',
  failed: 'Failed',
}

function StateIcon({ state }: { state: DeployStatusData['state'] }) {
  if (state === 'building') return <Spinner className="text-primary" />
  if (state === 'live') return <CheckIcon className="size-4 text-tertiary" strokeWidth={1.5} />
  if (state === 'failed') return <XIcon className="size-4 text-destructive" strokeWidth={1.5} />
  return null
}

export function DeployStatusCard({ data, onAction }: CardProps) {
  const d = data as DeployStatusData
  const showOpen = d.state === 'live' && d.url

  return (
    <article
      className="bg-background border rounded-2xl flex flex-col"
      style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
    >
      <header className="flex items-start justify-between gap-4 px-5 pt-5">
        <div>
          <h3 className="text-base font-bold text-font">{d.service}</h3>
          {d.ms !== undefined && (
            <p className="text-xs text-font/60 mt-0.5">{d.ms} ms</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <StateIcon state={d.state} />
          <span className="text-sm text-font/60">{stateLabel[d.state]}</span>
        </div>
      </header>

      {showOpen && (
        <footer
          className="flex items-center justify-end gap-3 px-5 py-4 mt-4 border-t"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <button
            className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm"
            onClick={() => {
              emitClick('ui:card:deploy-status:open')
              window.open(d.url)
            }}
          >
            Open
          </button>
        </footer>
      )}

      {!showOpen && <div className="pb-5" />}
    </article>
  )
}
