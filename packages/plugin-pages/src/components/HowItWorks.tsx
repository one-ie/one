// Ported verbatim from one.ie/web/src/components/cro/HowItWorks.tsx
const BRAND_TOKENS = new Set(['primary', 'secondary', 'tertiary'])

interface Step {
  label: string
  description: string
  detail?: string
}

interface HowItWorksProps {
  title?: string
  subtitle?: string
  steps: Step[]
  bgToken?: string
}

export function HowItWorks({ title = 'How it works', subtitle, steps, bgToken }: HowItWorksProps) {
  const hasBgToken = !!bgToken && bgToken !== 'none'
  const isBrandToken = hasBgToken && BRAND_TOKENS.has(bgToken)

  return (
    <section
      className={`px-6 py-24${isBrandToken ? ' text-on-primary' : ''}`}
      style={hasBgToken ? { backgroundColor: `var(--color-${bgToken})` } : undefined}
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-3">{title}</h2>
        {subtitle && <p className="text-font/60 text-center mb-16 max-w-xl mx-auto">{subtitle}</p>}
        {!subtitle && <div className="mb-16" />}

        <div className="relative">
          {steps.length > 1 && (
            <div
              className="absolute left-6 top-8 bottom-8 w-px hidden md:block"
              style={{ background: 'var(--color-border)' }}
            />
          )}
          <div className="flex flex-col gap-10">
            {steps.map((step, i) => (
              <div key={step.label} className="flex gap-6 md:gap-10 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-lg relative z-10">
                  {i + 1}
                </div>
                <div className="pt-2">
                  <h3 className="font-semibold text-base mb-1">{step.label}</h3>
                  <p className="text-font/60 text-sm leading-relaxed">{step.description}</p>
                  {step.detail && <p className="text-font/40 text-xs mt-2 font-mono">{step.detail}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
