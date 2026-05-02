import { lazy, Suspense } from 'react'

const ChatComponent = lazy(() => import('./Chat').then(m => ({ default: m.Chat })))

interface ChatLazyProps {
  fullPage?: boolean
  onClose?: () => void
}

export function ChatLazy({ fullPage, onClose }: ChatLazyProps) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full">Loading chat...</div>}>
      <ChatComponent fullPage={fullPage} onClose={onClose} />
    </Suspense>
  )
}
