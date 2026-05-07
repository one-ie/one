import { Check, X } from 'lucide-react'
import type { CardProps } from '@/lib/cards'

type VerifyData = Extract<CardProps['data'], { kind: 'verify' }>

export function VerifyCard({ data }: CardProps) {
  const { subject, checks } = data as VerifyData

  return (
    <article
      className="bg-background border rounded-2xl flex flex-col"
      style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
    >
      <header className="px-5 pt-5 pb-4">
        <h3 className="text-base font-bold text-font">{subject}</h3>
      </header>

      <div className="mx-5 mb-5 p-4 bg-foreground rounded-xl border flex flex-col gap-3" style={{ borderColor: 'var(--color-border)' }}>
        {checks.map((check, i) => (
          <div key={i} className="flex items-center gap-3">
            {check.pass ? (
              <Check size={16} strokeWidth={1.5} className="text-tertiary shrink-0" />
            ) : (
              <X size={16} strokeWidth={1.5} className="text-destructive shrink-0" />
            )}
            <span className={`text-sm ${check.pass ? 'text-font' : 'text-destructive'}`}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </article>
  )
}
