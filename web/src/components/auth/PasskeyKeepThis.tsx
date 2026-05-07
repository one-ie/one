import { useState } from 'react'
import { emitClick } from '@/lib/ui-signal'

interface PasskeyKeepThisProps {
  equity?: string       // e.g. "1 agent, 0 SUI" — what they'd lose
  onDismiss?: () => void
  onComplete?: () => void
}

export function PasskeyKeepThis({ equity, onDismiss, onComplete }: PasskeyKeepThisProps) {
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    emitClick('ui:passkey:save')
    setLoading(true)
    try {
      const res = await fetch('/api/provision', { method: 'POST' })
      if (res.ok) {
        onComplete?.()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLater = () => {
    emitClick('ui:passkey:later')
    onDismiss?.()
  }

  return (
    <article
      className="bg-background border rounded-2xl flex flex-col gap-4 p-5"
      style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
    >
      <header>
        <h3 className="text-base font-bold text-font">Save your wallet</h3>
        <p className="text-font/60 text-sm">Touch ID to keep your work safe</p>
      </header>

      <div
        className="bg-foreground rounded-xl border p-4"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {equity && <p className="text-sm text-font">{equity}</p>}
      </div>

      <footer className="flex gap-2">
        <button
          className="flex-1 bg-primary text-on-primary rounded-lg py-2 disabled:opacity-50"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Saving…' : 'Save with Touch ID'}
        </button>
        <button
          className="px-4 py-2 rounded-lg text-font/60"
          onClick={handleLater}
          disabled={loading}
        >
          Later
        </button>
      </footer>
    </article>
  )
}
