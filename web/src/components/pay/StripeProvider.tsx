import { Elements } from '@stripe/react-stripe-js'
import { loadStripe, type Stripe } from '@stripe/stripe-js'
import { useEffect, useState } from 'react'

type StripeElementsAppearance = {
  theme?: 'stripe' | 'night' | 'flat'
  variables?: Record<string, string>
  rules?: Record<string, Record<string, string>>
  labels?: 'above' | 'floating'
}

interface Props {
  children: React.ReactNode
  clientSecret: string
  appearance?: StripeElementsAppearance
}

let stripePromise: Promise<Stripe | null> | null = null

const getStripe = () => {
  if (!stripePromise) {
    const key = import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!key) return null
    stripePromise = loadStripe(key)
  }
  return stripePromise
}

const defaultAppearance: StripeElementsAppearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: 'var(--color-primary)',
    colorBackground: 'var(--color-background)',
    colorText: 'var(--color-font)',
    colorDanger: 'var(--color-destructive)',
    fontFamily: 'system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '6px',
  },
}

export function StripeProvider({ children, clientSecret, appearance = defaultAppearance }: Props) {
  const [stripe, setStripe] = useState<Stripe | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const p = getStripe()
    if (!p) { setError('Missing Stripe publishable key.'); return }
    p.then((s) => {
      if (s) setStripe(s)
      else setError('Failed to load Stripe.')
    }).catch(() => setError('Failed to initialize payment system.'))
  }, [])

  if (error) {
    return <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">{error}</div>
  }

  if (!stripe || !clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary" style={{ borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <Elements stripe={stripe} options={{ clientSecret, appearance, loader: 'auto' }}>
      {children}
    </Elements>
  )
}
