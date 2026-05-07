import { useEffect, useState } from 'react'
import { emitClick } from '@/lib/ui-signal'
import { PriceCard } from '@/components/cards/PriceCard'
import { EmptyStateCard } from '@/components/cards/EmptyStateCard'
import { ChatDock } from '@/components/chat/ChatDock'
import { Spinner } from '@/components/ui/spinner'
import type { CardData } from '@/lib/cards'

interface WalletBalance {
  sui: string
  eth: string
}

interface WalletStripe {
  status: string
}

interface WalletResponse {
  address: string | null
  balance: WalletBalance
  stripe: WalletStripe
}

interface Tx {
  id: string
  type: 'x402' | 'stripe'
  amount: string
  currency: string
  created_at: string
}

interface TxsResponse {
  type: string
  limit: number
  txs: Tx[]
  total: number
}

type FetchStatus = 'loading' | 'error' | 'ok'

interface PaymentsState {
  status: FetchStatus
  wallet: WalletResponse | null
  txs: Tx[]
  error: string | null
}

export function PaymentsView() {
  const [state, setState] = useState<PaymentsState>({
    status: 'loading',
    wallet: null,
    txs: [],
    error: null,
  })
  const [unauthorized, setUnauthorized] = useState(false)

  useEffect(() => {
    emitClick('ui:payments:view')

    const controller = new AbortController()

    Promise.all([
      fetch('/api/payments/wallet', { signal: controller.signal }),
      fetch('/api/payments/txs', { signal: controller.signal }),
    ])
      .then(async ([walletRes, txsRes]) => {
        if (walletRes.status === 401 || txsRes.status === 401) {
          setUnauthorized(true)
          return
        }
        if (!walletRes.ok || !txsRes.ok) {
          const body = await (!walletRes.ok ? walletRes : txsRes)
            .json()
            .catch(() => ({})) as { error?: string }
          setState(s => ({ ...s, status: 'error', error: body.error ?? 'Request failed' }))
          return
        }
        const wallet = (await walletRes.json()) as WalletResponse
        const txsData = (await txsRes.json()) as TxsResponse
        setState({
          status: 'ok',
          wallet,
          txs: txsData.txs ?? [],
          error: null,
        })
      })
      .catch(err => {
        if ((err as Error).name === 'AbortError') return
        setState(s => ({ ...s, status: 'error', error: (err as Error).message }))
      })

    return () => controller.abort()
  }, [])

  const { status, wallet, txs, error } = state

  if (unauthorized) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div
          className="bg-background border rounded-2xl p-8 text-center"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <p className="text-font/60">Sign in to view payments.</p>
        </div>
      </main>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-6 max-w-2xl">

      {/* Wallet card */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-font/60">
          Wallet
        </h2>

        {status === 'loading' && (
          <div className="flex items-center justify-center py-10">
            <Spinner className="size-5 text-font/40" />
          </div>
        )}

        {status === 'error' && (
          <p className="text-sm text-font/60 py-4">
            Could not load wallet: {error}
          </p>
        )}

        {status === 'ok' && wallet !== null && (
          <article
            className="bg-background border rounded-2xl flex flex-col"
            style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
          >
            <header className="px-5 pt-5 pb-4">
              <h3 className="text-base font-bold text-font">Wallet</h3>
              {wallet.address && (
                <p className="text-xs text-font/60 mt-1 font-mono break-all">{wallet.address}</p>
              )}
            </header>

            <div
              className="mx-5 mb-5 p-4 bg-foreground rounded-xl border flex flex-col gap-2"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-font/60">SUI</span>
                <span className="text-font font-medium">{wallet.balance.sui}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-font/60">ETH</span>
                <span className="text-font font-medium">{wallet.balance.eth}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-font/60">Stripe</span>
                <span className="text-font font-medium">{wallet.stripe.status}</span>
              </div>
            </div>
          </article>
        )}
      </section>

      {/* Revenue summary */}
      {status === 'ok' && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-font/60">
            Revenue
          </h2>
          <PriceCard
            surface="payments"
            data={{
              kind: 'price',
              label: 'Total',
              amount: '$0',
              currency: 'USD',
            } satisfies CardData}
            onAction={() => emitClick('ui:payments:revenue-action')}
          />
        </section>
      )}

      {/* Transaction list */}
      {status === 'ok' && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-font/60">
            Transactions
          </h2>

          {txs.length === 0 ? (
            <EmptyStateCard
              surface="payments"
              data={{
                kind: 'empty-state',
                title: 'No transactions yet',
                hint: 'Payments you receive will appear here.',
              } satisfies CardData}
              onAction={() => emitClick('ui:payments:empty-cta')}
            />
          ) : (
            <article
              className="bg-background border rounded-2xl flex flex-col"
              style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
            >
              <div
                className="mx-5 my-5 bg-foreground rounded-xl border divide-y"
                style={{ borderColor: 'var(--color-border)', '--tw-divide-opacity': '1' } as React.CSSProperties}
              >
                {txs.map(tx => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between px-4 py-3 text-sm"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-font font-medium">{tx.amount} {tx.currency}</span>
                      <span className="text-font/60 text-xs">{tx.type}</span>
                    </div>
                    <span className="text-font/60 text-xs">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          )}
        </section>
      )}

      <ChatDock surface="payments" />
    </div>
  )
}
