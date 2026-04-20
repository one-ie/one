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
    <section id="pricing" className="px-6 py-20">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-4">Simple pricing</h2>
        <p className="text-center text-zinc-400 mb-12">Start free, scale when you're ready</p>

        <div className="grid sm:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl p-6 ${
                plan.highlight ? 'bg-indigo-600 ring-2 ring-indigo-400' : 'bg-zinc-900 border border-zinc-800'
              }`}
            >
              <h3 className="font-semibold text-lg">{plan.name}</h3>
              <p className={`text-sm ${plan.highlight ? 'text-indigo-200' : 'text-zinc-400'} mb-4`}>{plan.description}</p>
              <div className="mb-6">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className={plan.highlight ? 'text-indigo-200' : 'text-zinc-400'}>{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  plan.highlight
                    ? 'bg-white text-indigo-600 hover:bg-zinc-100'
                    : 'bg-zinc-800 text-white hover:bg-zinc-700'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
