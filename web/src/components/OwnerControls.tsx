import { useEffect, useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { emitClick } from '@/lib/ui-signal'

interface Props {
  slug: string
}

export function OwnerControls({ slug }: Props) {
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    fetch(`/api/provision?probe=1&slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then((d: { owner?: boolean }) => setIsOwner(!!d.owner))
      .catch(() => {})
  }, [slug])

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
