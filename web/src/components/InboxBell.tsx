import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { emitClick } from '@/lib/ui-signal'

interface Props {
  slug: string
}

export function InboxBell({ slug }: Props) {
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    let cancelled = false

    const poll = async () => {
      try {
        const challengeRes = await fetch('/api/provision')
        if (!challengeRes.ok || cancelled) return
        const { challenge, token } = await challengeRes.json() as { challenge: string; token: string }
        const res = await fetch(
          `/api/notifications?slug=${encodeURIComponent(slug)}&challenge=${encodeURIComponent(challenge)}&token=${encodeURIComponent(token)}`,
        )
        if (!res.ok || cancelled) return
        const rows = await res.json() as Array<{ read: number }>
        if (!cancelled) setUnread(rows.filter(r => r.read === 0).length)
      } catch {
        // silent — network errors don't disrupt the UI
      }
    }

    poll()
    const id = setInterval(poll, 60000)
    return () => { cancelled = true; clearInterval(id) }
  }, [slug])

  if (unread === 0) {
    return (
      <button onClick={() => emitClick('ui:inbox:open')} className="p-2 rounded-lg text-font/60 hover:text-font hover:bg-foreground">
        <Bell size={16} />
      </button>
    )
  }

  return (
    <button onClick={() => emitClick('ui:inbox:open')} className="relative p-2 rounded-lg text-font/60 hover:text-font hover:bg-foreground">
      <Bell size={16} />
      <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-on-primary text-[9px] font-bold leading-none">
        {unread > 9 ? '9+' : unread}
      </span>
    </button>
  )
}
