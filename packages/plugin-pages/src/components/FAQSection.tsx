// Ported verbatim from one.ie/web/src/components/cro/FAQSection.tsx
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { emitClick } from '../lib/ui-signal'

const BRAND_TOKENS = new Set(['primary', 'secondary', 'tertiary'])

interface FAQ {
  q: string
  a: string
}

interface FAQSectionProps {
  title?: string
  faqs: FAQ[]
  bgToken?: string
}

export function FAQSection({ title = 'Common questions', faqs, bgToken }: FAQSectionProps) {
  const [open, setOpen] = useState<number | null>(null)

  const hasBgToken = !!bgToken && bgToken !== 'none'
  const isBrandToken = hasBgToken && BRAND_TOKENS.has(bgToken)

  return (
    <section
      className={`px-6 py-24 ${hasBgToken ? '' : 'bg-foreground/30'}${isBrandToken ? ' text-on-primary' : ''}`}
      style={hasBgToken ? { backgroundColor: `var(--color-${bgToken})` } : undefined}
    >
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-14">{title}</h2>
        <div className="flex flex-col gap-2">
          {faqs.map((faq, i) => (
            <article
              key={faq.q}
              className="bg-background rounded-xl border overflow-hidden"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <button
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-foreground/30 transition-colors"
                onClick={() => {
                  const next = open === i ? null : i
                  setOpen(next)
                  if (next !== null) emitClick('ui:faq:open', { question: faq.q })
                }}
              >
                <span className="font-medium text-sm text-font">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-font/40 flex-shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-5 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <p className="text-sm text-font/60 leading-relaxed pt-4">{faq.a}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
