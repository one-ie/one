import { useState } from 'react'
import { startRegistration } from '@simplewebauthn/browser'
import { emitClick } from '@/lib/ui-signal'

export function GetYoursButton() {
  const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

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
        body: JSON.stringify({ registration, userId: opts.userId, challenge: opts.challenge, token: opts.token }),
      })
      const data = await res.json() as { slug?: string; redirectTo?: string; error?: string; detail?: string }
      if (data.redirectTo) {
        setStatus('done')
        window.location.href = data.redirectTo
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
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={register}
        disabled={status === 'working' || status === 'done'}
        className="px-6 py-3 rounded-xl text-base font-semibold bg-primary text-on-primary disabled:opacity-50 hover:brightness-110 transition-all"
      >
        {status === 'working' ? 'Setting up…' : status === 'done' ? 'Ready!' : 'Create your space'}
      </button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-font/40">Uses your device's Face ID or Touch ID. Nothing stored on our servers except your public key.</p>
    </div>
  )
}
