import { useEffect, useState } from 'react'
import { Chat } from './Chat'
import { emitClick } from '@/lib/ui-signal'

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => setMounted(true))
      return () => cancelAnimationFrame(id)
    }
    setMounted(false)
  }, [open])

  return (
    <>
      <button
        onClick={() => { emitClick('ui:widget:open'); setOpen(true) }}
        aria-label="Open chat"
        aria-expanded={open}
        className={`fixed right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-500 transition-all z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${
          open ? 'scale-0' : 'scale-100'
        }`}
        style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>

      {open && (
        <div
          className={`fixed right-4 bottom-4 sm:right-6 sm:bottom-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden transition-all duration-200 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <Chat onClose={() => { emitClick('ui:widget:close'); setOpen(false) }} />
        </div>
      )}
    </>
  )
}
