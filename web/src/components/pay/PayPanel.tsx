import { CircleCheck, Sparkles } from 'lucide-react'
import { lazy, Suspense, useRef, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { IconBadge } from '@/components/ui/IconBadge'
import { PLANS, PriceCards, type PlanId } from './PriceCards'
import { emitClick } from '@/lib/ui-signal'

const StripeProvider     = lazy(() => import('./StripeProvider').then(m => ({ default: m.StripeProvider })))
const StripeCheckoutForm = lazy(() => import('./StripeCheckoutForm').then(m => ({ default: m.StripeCheckoutForm })))

interface Props { onComplete?: (paymentIntentId: string, planId: PlanId) => void }

export function PayPanel({ onComplete }: Props) {
  const [plan, setPlan] = useState<{ id: PlanId; amountCents: number } | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const cache = useRef<Map<PlanId, string>>(new Map())

  const pick = async (id: PlanId, amountCents: number) => {
    setError(null)
    setPlan({ id, amountCents })
    const cached = cache.current.get(id)
    if (cached) { setClientSecret(cached); return }
    setLoading(true)
    setClientSecret(null)
    try {
      const r = await fetch('/api/pay/create-intent', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: id }),
      })
      if (!r.ok) {
        const msg = (await r.json().catch(() => ({}))).error || `HTTP ${r.status}`
        setError(msg); emitClick('ui:pay:error', { message: msg })
        return
      }
      const j = await r.json() as { clientSecret: string }
      cache.current.set(id, j.clientSecret)
      setClientSecret(j.clientSecret)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'network error'
      setError(msg); emitClick('ui:pay:error', { message: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="my-2">
      <PriceCards selected={plan?.id} onSelect={pick} />
      {error && <p className="text-sm text-destructive my-2">{error}</p>}
      {plan && clientSecret && (
        <Suspense fallback={null}>
          <div className="bg-background rounded-2xl p-5 border mt-4" style={{ borderColor: 'var(--color-border)' }}>
            {done ? (
              (() => {
                const p = PLANS.find(x => x.id === plan?.id)
                return (
                  <div className="flex flex-col items-center text-center gap-5 py-4">
                    <span className="w-16 h-16 rounded-full bg-tertiary/15 inline-flex items-center justify-center">
                      <Icon icon={CircleCheck} size="xl" className="text-tertiary" />
                    </span>
                    <div className="flex flex-col gap-1">
                      <p className="text-lg font-bold">Payment successful</p>
                      {p && (
                        <div className="flex items-center justify-center gap-2 mt-1">
                          <IconBadge icon={p.icon} tone={p.tone} size="md" />
                          <span className="font-medium">{p.name}</span>
                          <span className="text-font/60">${(p.amountCents / 100).toFixed(0)}{p.period}</span>
                        </div>
                      )}
                      <p className="text-sm text-font/60 mt-1">Your plan activates shortly. Welcome aboard.</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground border w-full justify-center" style={{ borderColor: 'var(--color-border)' }}>
                      <Icon icon={Sparkles} size="sm" className="text-tertiary shrink-0" />
                      <p className="text-xs text-font/60 font-mono truncate">{done}</p>
                    </div>
                  </div>
                )
              })()
            ) : (
              <StripeProvider key={clientSecret} clientSecret={clientSecret}>
                <StripeCheckoutForm
                  key={plan.id}
                  amount={plan.amountCents / 100}
                  onSuccess={(piId) => {
                    emitClick('ui:pay:success', { paymentIntentId: piId, planId: plan.id, amount: plan.amountCents })
                    setDone(piId); onComplete?.(piId, plan.id)
                  }}
                  onError={(msg) => emitClick('ui:pay:error', { message: msg })}
                />
              </StripeProvider>
            )}
          </div>
        </Suspense>
      )}
    </div>
  )
}
