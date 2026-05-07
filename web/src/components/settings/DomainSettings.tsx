import { useState } from 'react'
import { emitClick } from '@/lib/ui-signal'

type Step = 'idle' | 'pending-dns' | 'verified' | 'error'

interface Props {
  slug: string
}

export function DomainSettings({ slug }: Props) {
  const [host, setHost] = useState('')
  const [step, setStep] = useState<Step>('idle')
  const [txtRecord, setTxtRecord] = useState('')
  const [verifyToken, setVerifyToken] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const getAuth = async () => {
    const res = await fetch('/api/auth')
    return res.json() as Promise<{ challenge: string; token: string }>
  }

  const handleRegister = async () => {
    emitClick('ui:settings:domain-register')
    const domain = host.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
    if (!domain) return
    setBusy(true)
    setMessage('')
    try {
      const { challenge, token } = await getAuth()
      const res = await fetch('/api/domain?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, host: domain, challenge, token }),
      })
      if (!res.ok) { setMessage(await res.text()); setStep('error'); return }
      const data = await res.json() as { verifyToken: string; txtRecord: string }
      setVerifyToken(data.verifyToken)
      setTxtRecord(data.txtRecord)
      setHost(domain)
      setStep('pending-dns')
    } catch (e) {
      setMessage(String(e))
      setStep('error')
    } finally {
      setBusy(false)
    }
  }

  const handleVerify = async () => {
    emitClick('ui:settings:domain-verify')
    setBusy(true)
    setMessage('')
    try {
      const { challenge, token } = await getAuth()
      const res = await fetch('/api/domain?action=verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, host, challenge, token }),
      })
      if (!res.ok) { setMessage(await res.text()); setStep('error'); return }
      const data = await res.json() as { verified: boolean; found?: string[] }
      if (data.verified) {
        setStep('verified')
        setMessage('')
      } else {
        setMessage(
          data.found?.length
            ? `TXT record not matched. Found: ${data.found.join(', ')}`
            : 'TXT record not found yet — DNS changes can take up to 24 hours to propagate.',
        )
      }
    } catch (e) {
      setMessage(String(e))
      setStep('error')
    } finally {
      setBusy(false)
    }
  }

  if (step === 'verified') {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-font">Domain connected</p>
        <p className="text-sm font-mono text-tertiary">{host}</p>
        <p className="text-xs text-font/60">
          Your workspace is live at <span className="font-mono">https://{host}</span>
        </p>
      </div>
    )
  }

  if (step === 'pending-dns') {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-font">Step 1 — Add a CNAME record</p>
          <div
            className="p-3 rounded-lg bg-foreground border text-sm font-mono grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 items-baseline"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <span className="text-xs text-font/60 uppercase tracking-wide">Type</span>
            <span className="text-font">CNAME</span>
            <span className="text-xs text-font/60 uppercase tracking-wide">Name</span>
            <span className="text-font">{host}</span>
            <span className="text-xs text-font/60 uppercase tracking-wide">Value</span>
            <span className="text-font">one.ie</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-font">Step 2 — Add a TXT record to verify ownership</p>
          <div
            className="p-3 rounded-lg bg-foreground border text-sm font-mono grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 items-baseline"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <span className="text-xs text-font/60 uppercase tracking-wide">Type</span>
            <span className="text-font">TXT</span>
            <span className="text-xs text-font/60 uppercase tracking-wide">Name</span>
            <span className="text-font break-all">{txtRecord}</span>
            <span className="text-xs text-font/60 uppercase tracking-wide">Value</span>
            <span className="text-font break-all">{verifyToken}</span>
          </div>
          <p className="text-xs text-font/60">Add both records in your DNS provider, then click Verify. DNS changes can take up to 24 hours.</p>
        </div>

        {message && <p className="text-sm text-font/60">{message}</p>}

        <div className="flex items-center gap-3">
          <button
            onClick={handleVerify}
            disabled={busy}
            className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50"
          >
            {busy ? 'Checking…' : 'Verify DNS'}
          </button>
          <button
            onClick={() => { setStep('idle'); setHost(''); setMessage('') }}
            className="px-4 py-2 rounded-lg text-font text-sm hover:bg-foreground transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="domain-input" className="text-sm font-medium text-font">
          Domain
        </label>
        <input
          id="domain-input"
          type="text"
          value={host}
          onChange={(e) => setHost(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
          className="px-3.5 py-2.5 rounded-lg bg-background text-font border focus:outline-none focus:ring-2 focus:ring-primary/25 text-sm"
          style={{ borderColor: 'var(--color-border)' }}
          placeholder="yourdomain.com"
        />
        <p className="text-xs text-font/60">
          You'll add a CNAME pointing to <span className="font-mono">one.ie</span> and a TXT record to verify ownership.
        </p>
      </div>

      {message && <p className="text-sm text-font/60">{message}</p>}

      <div>
        <button
          onClick={handleRegister}
          disabled={busy || !host.trim()}
          className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50"
        >
          {busy ? 'Working…' : 'Connect domain'}
        </button>
      </div>
    </div>
  )
}
