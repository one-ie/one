import { emitClick } from '@/lib/ui-signal'
import { cn } from '@/lib/utils'

interface EmptyCardProps {
  title: string
  hint?: string
  children?: React.ReactNode
  className?: string
}

export function EmptyCard({ title, hint, children, className }: EmptyCardProps) {
  return (
    <article
      className={cn('bg-background border rounded-2xl flex flex-col gap-4 p-5', className)}
      style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-bold text-font">{title}</h3>
        {hint && <p className="text-sm text-font/60">{hint}</p>}
      </div>

      <div
        className="bg-foreground rounded-xl border p-4"
        style={{ borderColor: 'var(--color-border)' }}
        onClick={!children ? () => emitClick('ui:emptycard:focus') : undefined}
      >
        {children ?? (
          <button
            type="button"
            className="w-full text-left text-sm text-font/40 focus:outline-none"
            onClick={() => emitClick('ui:emptycard:focus')}
          >
            Type a message…
          </button>
        )}
      </div>
    </article>
  )
}
