import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { emitClick } from '@/lib/ui-signal'
import { startAuthentication } from '@simplewebauthn/browser'

interface Props {
  slug: string
  file: string
  content: string
  challenge: string
  token: string
  preview: string
  onCommitted?: (url: string) => void
  onDiscard?: () => void
}

export function PreviewCard({ slug, file, content, challenge, token, preview, onCommitted, onDiscard }: Props) {
  const [status, setStatus] = useState<'idle' | 'signing' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')
  const [liveUrl, setLiveUrl] = useState('')

  const approve = async () => {
    emitClick('ui:chat:approve-write')
    setStatus('signing')
    try {
      const credRes = await fetch(`/api/commit?slug=${encodeURIComponent(slug)}`)
      const credData = await credRes.json() as { credentialId?: string }
      const assertion = await startAuthentication({
        optionsJSON: {
          challenge,
          rpId: window.location.hostname,
          userVerification: 'required' as const,
          timeout: 60000,
          allowCredentials: credData.credentialId
            ? [{ type: 'public-key' as const, id: credData.credentialId }]
            : [],
        },
      })
      const res = await fetch('/api/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, file, content, challenge, token, assertion }),
      })
      const data = await res.json() as { ok?: boolean; url?: string; error?: string }
      if (data.ok && data.url) {
        setLiveUrl(data.url)
        setStatus('done')
        onCommitted?.(data.url)
      } else {
        setError(data.error ?? 'commit failed')
        setStatus('error')
      }
    } catch (e) {
      setError(String(e))
      setStatus('error')
    }
  }

  if (status === 'done' && liveUrl) {
    return (
      <div className="bg-background border rounded-xl p-4 space-y-3" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2 text-sm font-medium">
          <Check size={14} className="text-success" />
          <span>Live</span>
          <span className="text-font/40 text-xs truncate flex-1">{liveUrl}</span>
        </div>
        <div className="flex gap-2">
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => emitClick('ui:chat:open-live')}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-primary text-on-primary hover:brightness-110"
          >
            Open ↗
          </a>
          <button
            onClick={() => { emitClick('ui:chat:copy-url'); navigator.clipboard.writeText(liveUrl) }}
            className="px-3 py-2 rounded-lg text-sm border text-font"
            style={{ borderColor: 'var(--color-border)' }}
          >
            Copy URL
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background border rounded-xl p-4 space-y-3" style={{ borderColor: 'var(--color-border)' }}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{file}</span>
        <span className="text-xs text-font/60 bg-foreground px-2 py-0.5 rounded">pending</span>
      </div>
      <pre className="text-xs text-font/60 bg-foreground rounded p-3 overflow-auto max-h-32">{preview}</pre>
      {status === 'error' && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => { emitClick('ui:chat:discard-write'); onDiscard?.() }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-font border"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <X size={14} /> Discard
        </button>
        <button
          onClick={approve}
          disabled={status === 'signing' || status === 'done'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-primary text-on-primary disabled:opacity-50"
        >
          <Check size={14} /> {status === 'signing' ? 'Signing…' : 'Approve'}
        </button>
      </div>
    </div>
  )
}
