import { useState } from 'react'
import { startRegistration } from '@simplewebauthn/browser'
import { emitClick } from '@/lib/ui-signal'

interface Props { slug: string }

export function AddDeviceButton({ slug }: Props) {
  const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  const addDevice = async () => {
    emitClick('ui:settings:add-device')
    setStatus('working')
    try {
      const optRes = await fetch('/api/provision')
      const opts = await optRes.json() as { challenge: string; token: string; userId: string; rpId: string; rpName: string }
      const registration = await startRegistration({
        optionsJSON: {
          rp: { id: opts.rpId, name: opts.rpName },
          user: { id: opts.userId, name: slug, displayName: slug },
          challenge: opts.challenge,
          pubKeyCredParams: [{ alg: -7, type: 'public-key' as const }, { alg: -257, type: 'public-key' as const }],
          timeout: 60000,
          attestation: 'none' as const,
          authenticatorSelection: { authenticatorAttachment: 'platform' as const, residentKey: 'required' as const, userVerification: 'required' as const },
        },
      })
      const res = await fetch('/api/settings?action=add-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, registration, challenge: opts.challenge, token: opts.token }),
      })
      const data = await res.json() as { ok?: boolean; error?: string }
      if (data.ok) {
        setStatus('done')
        window.location.reload()
      } else {
        setError(data.error ?? 'failed to add device')
        setStatus('error')
      }
    } catch (e) {
      setError(String(e))
      setStatus('error')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={addDevice}
        disabled={status === 'working' || status === 'done'}
        className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border text-font disabled:opacity-50 hover:text-font/80"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {status === 'working' ? 'Adding device…' : '+ Add this device'}
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
