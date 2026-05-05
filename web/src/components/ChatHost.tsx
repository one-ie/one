import { useState, useEffect, lazy, Suspense } from 'react'
import { ChatWidget } from '@/components/ChatWidget'
import { emitClick } from '@/lib/ui-signal'

type ChatMode = 'wide' | 'rail' | 'icon' | 'none'

interface Props {
  defaultMode: ChatMode
  lock: boolean
}

const ChatLazy = lazy(() => import('@/components/Chat').then((m) => ({ default: m.Chat })))

export function ChatHost({ defaultMode, lock }: Props) {
  const [mode, setMode] = useState<ChatMode>(defaultMode)

  useEffect(() => {
    const domMode = document.documentElement.dataset.chatMode as ChatMode | undefined
    if (domMode && domMode !== mode) setMode(domMode)

    const handler = (e: Event) => setMode((e as CustomEvent<ChatMode>).detail)
    window.addEventListener('one:chat-mode', handler)
    return () => window.removeEventListener('one:chat-mode', handler)
  }, [])

  const switchMode = (next: ChatMode) => {
    emitClick('ui:layout:mode-switch', { from: mode, to: next })
    setMode(next)
    document.documentElement.dataset.chatMode = next
    try {
      localStorage.setItem('one:chat-mode', JSON.stringify(next))
    } catch {}
  }

  if (mode === 'none') return null
  if (mode === 'icon') return <ChatWidget />

  const chatMode = mode === 'wide' ? 'rail-45' : 'rail-25'

  return (
    <div className="chat-rail">
      <div className="flex-1 overflow-hidden min-h-0">
        <Suspense fallback={null}>
          <ChatLazy
            mode={chatMode}
            onModeChange={switchMode}
            currentMode={mode}
            canSwitch={!lock}
          />
        </Suspense>
      </div>
    </div>
  )
}
