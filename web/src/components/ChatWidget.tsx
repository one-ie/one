import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { Chat } from '@/components/Chat'
import { Icon } from '@/components/ui/Icon'

export function ChatWidget() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open chat"
        className={`fixed bottom-6 right-6 w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center transition-all z-50 hover:brightness-110 ${
          open ? 'scale-0' : 'scale-100'
        }`}
        style={{ boxShadow: 'var(--shadow-pop)' }}
      >
        <Icon icon={MessageCircle} size="lg" />
      </button>

      {open && (
        <div
          className="fixed bottom-6 right-6 bg-background rounded-2xl z-50 overflow-hidden border"
          style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-pop)' }}
        >
          <Chat onClose={() => setOpen(false)} />
        </div>
      )}
    </>
  )
}
