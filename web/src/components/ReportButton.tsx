import { useState } from 'react'
import { Flag } from 'lucide-react'
import { emitClick } from '@/lib/ui-signal'

interface Props {
  host: string
  path: string
  isOwner?: boolean
}

export function ReportButton({ host, path, isOwner }: Props) {
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState('spam')
  const [body, setBody] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (isOwner) return null

  if (submitted) {
    return <span className="text-xs text-font/40">Report submitted</span>
  }

  if (!open) {
    return (
      <button
        onClick={() => { emitClick('ui:report:open'); setOpen(true) }}
        className="flex items-center gap-1 text-xs text-font/40 hover:text-font/60"
      >
        <Flag size={12} />
        Report
      </button>
    )
  }

  const submit = async () => {
    emitClick('ui:report:submit')
    await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ host, path, kind, body: body || undefined }),
    })
    setSubmitted(true)
  }

  return (
    <div className="flex flex-col gap-2 p-3 bg-background border rounded-lg text-sm" style={{ borderColor: 'var(--color-border)' }}>
      <select
        value={kind}
        onChange={e => setKind(e.target.value)}
        className="px-2 py-1.5 rounded-lg bg-foreground border text-font text-xs focus:outline-none"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <option value="spam">Spam</option>
        <option value="harmful">Harmful content</option>
        <option value="impersonation">Impersonation</option>
        <option value="other">Other</option>
      </select>
      <textarea
        placeholder="Optional details"
        value={body}
        onChange={e => setBody(e.target.value)}
        rows={2}
        className="px-2 py-1.5 rounded-lg bg-foreground border text-font text-xs resize-none focus:outline-none placeholder:text-font/40"
        style={{ borderColor: 'var(--color-border)' }}
      />
      <div className="flex gap-2">
        <button onClick={submit} className="flex-1 py-1.5 rounded-lg text-xs bg-destructive text-white hover:brightness-110">Submit</button>
        <button onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-lg text-xs border text-font" style={{ borderColor: 'var(--color-border)' }}>Cancel</button>
      </div>
    </div>
  )
}
