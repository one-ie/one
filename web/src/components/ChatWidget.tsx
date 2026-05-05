import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { ChatLazy } from '@/components/ChatLazy'
import { Icon } from '@/components/ui/Icon'
import { emitClick } from '@/lib/ui-signal'

type ChatMode = 'wide' | 'rail' | 'icon' | 'none'

export function ChatWidget() {
  const [open, setOpen] = useState(false)

  const switchLayout = (next: ChatMode) => {
    emitClick('ui:layout:mode-switch', { from: 'icon', to: next })
    document.documentElement.dataset.chatMode = next
    try { localStorage.setItem('one:chat-mode', JSON.stringify(next)) } catch {}
    window.dispatchEvent(new CustomEvent('one:chat-mode', { detail: next }))
    setOpen(false)
  }

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
          style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-pop)', width: 380, height: 560 }}
        >
          <ChatLazy
            onClose={() => setOpen(false)}
            onModeChange={switchLayout}
            currentMode="icon"
            canSwitch
          />
        </div>
      )}
    </>
  )
}
