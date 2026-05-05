import { useEffect, useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { emitClick } from '@/lib/ui-signal'

interface Props {
  slug: string
}

export function OwnerControls({ slug }: Props) {
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const cred = await navigator.credentials.get({
          mediation: 'silent',
          publicKey: {
            challenge: crypto.getRandomValues(new Uint8Array(16)),
            rpId: window.location.hostname,
            userVerification: 'discouraged',
            allowCredentials: [],
          },
        })
        if (!cancelled) setIsOwner(!!cred)
      } catch {
        if (!cancelled) setIsOwner(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  if (!isOwner) return null

  return (
    <div className="flex gap-2">
      <a
        href={`/u/${slug}/chat`}
        onClick={() => emitClick('ui:owner:edit')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border text-font"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <Pencil size={14} /> Edit
      </a>
      <a
        href={`/u/${slug}/chat?seed=new`}
        onClick={() => emitClick('ui:owner:new')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-primary text-on-primary"
      >
        <Plus size={14} /> New
      </a>
    </div>
  )
}
