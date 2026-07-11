// Ported from one.ie/web/src/components/cro/PricingSection.tsx — hrefs additionally
// wrapped in safeHref() (see ../lib/safe-url.ts): public, no-login render surface.
import { Check } from 'lucide-react'
import { useState } from 'react'
import { emitClick } from '../lib/ui-signal'
import { safeHref } from '../lib/safe-url'

export interface PricingTier {
  name: string
  monthlyPrice: string
  annualPrice: string
  description: string
  features: string[]
  cta: string
  ctaHref: string
  popular?: boolean
  enterprise?: boolean
}

interface PricingSectionProps {
  title?: string
  subtitle?: string
  tiers: PricingTier[]
}

export function PricingSection({
  title = 'Simple pricing',
  subtitle = 'Annual billing pre-selected saves you 20%.',
  tiers,
}: PricingSectionProps) {
  const [annual, setAnnual] = useState(true)

  return (
    <section className="px-6 py-24 bg-foreground/30">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-3">{title}</h2>
        <p className="text-font/60 text-center mb-10 max-w-xl mx-auto">{subtitle}</p>

        <div className="flex justify-center mb-12">
          <div
            className="inline-flex items-center gap-1 bg-background border rounded-full p-1"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <button
              onClick={() => {
                setAnnual(true)
                emitClick('ui:pricing:annual')
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${annual ? 'bg-primary text-on-primary' : 'text-font/60 hover:text-font'}`}
            >
              Annual <span className="text-xs opacity-70 ml-1">save 20%</span>
            </button>
            <button
              onClick={() => {
                setAnnual(false)
                emitClick('ui:pricing:monthly')
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!annual ? 'bg-primary text-on-primary' : 'text-font/60 hover:text-font'}`}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 items-start">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={`bg-background rounded-2xl border flex flex-col relative overflow-hidden ${tier.popular ? 'ring-2 ring-primary' : ''}`}
              style={{
                borderColor: tier.popular ? 'var(--color-primary)' : 'var(--color-border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              {tier.popular && (
                <div className="absolute top-0 inset-x-0 bg-primary text-on-primary text-xs font-semibold text-center py-1.5 tracking-wide uppercase">
                  Most popular
                </div>
              )}

              <header
                className={`px-6 ${tier.popular ? 'pt-10' : 'pt-6'} pb-6 border-b`}
                style={{ borderColor: 'var(--color-border)' }}
              >
                <h3 className="font-bold text-lg mb-1">{tier.name}</h3>
                <p className="text-font/50 text-sm mb-4">{tier.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{annual ? tier.annualPrice : tier.monthlyPrice}</span>
                  {!tier.enterprise && <span className="text-font/40 text-sm">/mo</span>}
                </div>
              </header>

              <div className="px-6 py-6 flex flex-col gap-3 flex-1">
                {(tier.features ?? []).map((f) => (
                  <div key={f} className="flex gap-2.5 items-start">
                    <Check size={15} className="text-tertiary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-font/70">{f}</span>
                  </div>
                ))}
              </div>

              <div className="px-6 pb-6">
                <a
                  href={safeHref(tier.ctaHref) ?? '#'}
                  onClick={() => emitClick('ui:pricing:tier-cta', { tier: tier.name })}
                  className={`w-full inline-flex items-center justify-center py-3 px-6 rounded-xl font-medium text-sm transition ${
                    tier.popular ? 'bg-primary text-on-primary hover:brightness-110' : 'bg-foreground text-font hover:bg-foreground/80 border'
                  }`}
                  style={!tier.popular ? { borderColor: 'var(--color-border)' } : {}}
                >
                  {tier.cta}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
