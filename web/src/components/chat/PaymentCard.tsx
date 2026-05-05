import { useState } from 'react'
import { emitClick } from '@/lib/ui-signal'

interface Props {
  skill: string
  price: number
  wallet?: string
  onSubmit: (receipt: string, skill: string, amount: number) => void
}

export function PaymentCard({ skill, price, wallet, onSubmit }: Props) {
  const [receipt, setReceipt] = useState('')
  const [copied, setCopied] = useState(false)

  const copyWallet = () => {
    if (wallet) navigator.clipboard.writeText(wallet)
    emitClick('ui:chat:copy-wallet')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="bg-background border rounded-xl p-4 space-y-3" style={{ borderColor: 'var(--color-border)' }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{skill}</p>
          <p className="text-xl font-bold mt-0.5">${price.toFixed(2)}</p>
        </div>
        <span className="px-2 py-1 rounded-full text-xs bg-foreground text-font/60 border" style={{ borderColor: 'var(--color-border)' }}>
          skill
        </span>
      </div>
      {wallet && (
        <div className="flex items-center gap-2 p-2.5 bg-foreground rounded-lg border text-xs" style={{ borderColor: 'var(--color-border)' }}>
          <span className="text-font/60 flex-1 font-mono truncate">{wallet}</span>
          <button onClick={copyWallet} className="text-font/60 hover:text-font shrink-0">
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Paste transaction hash after paying"
          value={receipt}
          onChange={e => setReceipt(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-background text-sm border text-font placeholder:text-font/40 focus:outline-none"
          style={{ borderColor: 'var(--color-border)' }}
        />
        <button
          disabled={!receipt.trim()}
          onClick={() => {
            emitClick('ui:chat:pay-submit')
            onSubmit(receipt.trim(), skill, price)
          }}
          className="w-full py-2 rounded-lg text-sm bg-primary text-on-primary hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Submit receipt
        </button>
      </div>
    </div>
  )
}
