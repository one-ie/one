import { useState } from 'react'
import { startRegistration } from '@simplewebauthn/browser'
import { emitClick } from '@/lib/ui-signal'

export function GetYoursButton() {
  const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [tosAccepted, setTosAccepted] = useState(false)

  const register = async () => {
    emitClick('ui:get-yours:register')
    setStatus('working')
    try {
      const optRes = await fetch('/api/provision')
      const opts = await optRes.json() as { challenge: string; token: string; userId: string; rpId: string; rpName: string }

      const registrationOptions = {
        rp: { id: opts.rpId, name: opts.rpName },
        user: { id: opts.userId, name: 'one-user', displayName: 'ONE User' },
        challenge: opts.challenge,
        pubKeyCredParams: [{ alg: -7, type: 'public-key' as const }, { alg: -257, type: 'public-key' as const }],
        timeout: 60000,
        attestation: 'none' as const,
        authenticatorSelection: { authenticatorAttachment: 'platform' as const, residentKey: 'required' as const, userVerification: 'required' as const },
      }

      const registration = await startRegistration({ optionsJSON: registrationOptions })

      const res = await fetch('/api/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration, userId: opts.userId, challenge: opts.challenge, token: opts.token,
          displayName: displayName.trim() || undefined,
          tosTimestamp: Date.now(),
        }),
      })
      const data = await res.json() as { slug?: string; recoveryWords?: string[]; redirectTo?: string; error?: string; detail?: string }
      if (data.redirectTo && data.slug) {
        if (data.recoveryWords?.length) {
          sessionStorage.setItem('rc:words', JSON.stringify(data.recoveryWords))
        }
        setStatus('done')
        window.location.href = `/recovery-codes?slug=${encodeURIComponent(data.slug)}&next=${encodeURIComponent(data.redirectTo)}`
      } else {
        setError([data.error, data.detail].filter(Boolean).join(': ') || 'registration failed')
        setStatus('error')
      }
    } catch (e) {
      setError(String(e))
      setStatus('error')
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xs">
      <input
        type="text"
        placeholder="Your name (optional)"
        value={displayName}
        onChange={e => setDisplayName(e.target.value)}
        disabled={status !== 'idle'}
        className="w-full px-3.5 py-2.5 rounded-lg bg-background text-font border text-sm focus:outline-none"
        style={{ borderColor: 'var(--color-border)' }}
      />
      <label className="flex items-start gap-2 text-sm text-font/60 cursor-pointer">
        <input
          type="checkbox"
          checked={tosAccepted}
          onChange={e => setTosAccepted(e.target.checked)}
          disabled={status !== 'idle'}
          className="mt-0.5 bg-background"
        />
        I agree to the terms of service
      </label>
      <button
        onClick={register}
        disabled={!tosAccepted || status === 'working' || status === 'done'}
        className="w-full px-6 py-3 rounded-xl text-base font-semibold bg-primary text-on-primary disabled:opacity-50 hover:brightness-110 transition-all"
      >
        {status === 'working' ? 'Setting up…' : status === 'done' ? 'Ready!' : 'Create your space'}
      </button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-font/40">Uses your device's Face ID or Touch ID. Nothing stored on our servers except your public key.</p>
    </div>
  )
}
