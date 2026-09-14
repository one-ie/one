// Ported verbatim from one.ie/web/src/components/cro/ProofBar.tsx
import { onText } from '../lib/surface-chrome'

interface Stat {
  label: string
  value: string
  source?: string
}

interface NamedQuote {
  quote: string
  name: string
  role: string
  company: string
}

interface ProofBarProps {
  stats?: Stat[]
  leadQuote?: NamedQuote
  bgToken?: string
}

export function ProofBar({ stats, leadQuote, bgToken }: ProofBarProps) {
  const hasBgToken = !!bgToken && bgToken !== 'none'
  // Per-token contrast. Was `text-on-primary` for all three brand fills.
  const onTextClass = onText(bgToken)

  return (
    <section
      className={`px-6 py-12 border-y${onTextClass ? ` ${onTextClass}` : ''}`}
      style={{ borderColor: 'var(--color-border)', ...(hasBgToken ? { backgroundColor: `var(--color-${bgToken})` } : {}) }}
    >
      <div className="max-w-5xl mx-auto">
        {stats && stats.length > 0 && (
          <div className="flex flex-wrap justify-center gap-10 mb-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-font">{s.value}</p>
                <p className="text-xs text-font/50 mt-1">{s.label}</p>
                {s.source && <p className="text-xs text-font/30">{s.source}</p>}
              </div>
            ))}
          </div>
        )}
        {leadQuote && (
          <blockquote className="max-w-2xl mx-auto text-center">
            <p className="text-font/70 text-base italic leading-relaxed">&quot;{leadQuote.quote}&quot;</p>
            <footer className="mt-3">
              <span className="text-sm font-semibold text-font">{leadQuote.name}</span>
              <span className="text-sm text-font/50"> · {leadQuote.role} · {leadQuote.company}</span>
            </footer>
          </blockquote>
        )}
      </div>
    </section>
  )
}
