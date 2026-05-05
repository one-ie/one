import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import type { StripePaymentElementOptions } from '@stripe/stripe-js'
import { Loader2, Lock } from 'lucide-react'
import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { emitClick } from '@/lib/ui-signal'

const options: StripePaymentElementOptions = {
  layout: 'accordion',
  paymentMethodOrder: ['card'],
  wallets: { applePay: 'never', googlePay: 'never' },
  terms: { card: 'never' },
}

interface Props { amount: number; onSuccess: (id: string) => void; onError?: (m: string) => void }

export function StripeCheckoutForm({ amount, onSuccess, onError }: Props) {
  const stripe = useStripe()
  const elements = useElements()
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    emitClick('ui:pay:card-submit')
    setBusy(true); setErr(null)
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: 'if_required',
      })
      if (error) { setErr(error.message ?? 'Payment failed'); onError?.(error.message ?? 'failed') }
      else if (paymentIntent?.status === 'succeeded') onSuccess(paymentIntent.id)
      else if (paymentIntent) setErr(`Unexpected status: ${paymentIntent.status}`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Payment error'
      setErr(msg); onError?.(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <PaymentElement options={options} onReady={() => setReady(true)} />
      {err && <p className="text-sm text-destructive">{err}</p>}
      <button
        type="submit"
        disabled={!stripe || !ready || busy}
        className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary rounded-lg px-4 py-2.5 font-medium hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition"
        style={{ transitionDuration: 'var(--ease, 120ms)' }}
      >
        {busy ? (
          <><Icon icon={Loader2} size="sm" className="animate-spin" /> Processing…</>
        ) : (
          <><Icon icon={Lock} size="sm" /> Pay ${amount.toFixed(0)}</>
        )}
      </button>
    </form>
  )
}
