import { useEffect, useState } from 'react'
import { emitClick } from '@/lib/ui-signal'

interface MobileHandoffProps {
  surface: string
  viewer?: 'creator' | 'developer' | 'end_user'
}

export function MobileHandoff({ surface, viewer }: MobileHandoffProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (viewer !== 'developer' && viewer !== 'creator') return
    emitClick('ui:mobile-handoff:shown', { surface })
  }, [surface, viewer])

  if (viewer !== 'developer' && viewer !== 'creator') return null

  const handleCopy = () => {
    emitClick('ui:mobile-handoff:copy')
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 sm:hidden z-50 p-4">
      <div
        className="bg-background border rounded-2xl p-4 flex items-center justify-between gap-3"
        style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-pop)' }}
      >
        <p className="text-font text-sm flex-1">Best on desktop. Continue on your computer.</p>
        <button
          className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-sm shrink-0"
          onClick={handleCopy}
        >
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>
    </div>
  )
}
