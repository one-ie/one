import { Check } from 'lucide-react'
import { Icon } from '@/components/ui/Icon'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for testing',
    features: ['100 messages/month', 'Web chat only', 'Basic analytics', 'Community support'],
    cta: 'Get started',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For growing businesses',
    features: ['Unlimited messages', 'Web + Telegram + Discord', 'Advanced analytics', 'Priority support', 'Custom branding'],
    cta: 'Start free trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large teams',
    features: ['Everything in Pro', 'Dedicated support', 'SLA guarantee', 'On-premise option', 'Custom integrations'],
    cta: 'Contact us',
    highlight: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold tracking-tight text-center mb-2">Simple pricing</h2>
        <p className="text-center text-font/60 mb-12">Start free, scale when you're ready</p>

        <div className="grid sm:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isHighlight = plan.highlight
            return (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 border ${
                  isHighlight ? 'bg-primary text-on-primary' : 'bg-background'
                }`}
                style={{
                  borderColor: isHighlight
                    ? 'color-mix(in oklab, var(--color-on-primary) 18%, transparent)'
                    : 'var(--color-border)',
                  boxShadow: isHighlight
                    ? 'var(--shadow-pop)'
                    : 'var(--shadow-card)',
                }}
              >
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <p className={`text-sm mb-4 ${isHighlight ? 'opacity-80' : 'text-font/60'}`}>
                  {plan.description}
                </p>
                <div className="mb-6">
                  <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
                  <span className={isHighlight ? 'opacity-80' : 'text-font/60'}>{plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span
                        className="mt-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full flex-shrink-0"
                        style={{
                          background: isHighlight
                            ? 'color-mix(in oklab, var(--color-on-primary) 20%, transparent)'
                            : 'color-mix(in oklab, var(--color-tertiary) 16%, var(--color-foreground))',
                          color: isHighlight ? 'var(--color-on-primary)' : 'var(--color-tertiary)',
                        }}
                      >
                        <Icon icon={Check} size="sm" />
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="w-full py-2.5 rounded-lg font-medium transition hover:brightness-110"
                  style={
                    isHighlight
                      ? { background: 'var(--color-on-primary)', color: 'var(--color-primary)' }
                      : { background: 'var(--color-secondary)', color: 'var(--color-on-secondary)' }
                  }
                >
                  {plan.cta}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
