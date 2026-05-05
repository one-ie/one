import { lazy, Suspense } from 'react'
import type { ComponentProps } from 'react'
import type { Chat } from './Chat'

const ChatComponent = lazy(() => import('./Chat').then(m => ({ default: m.Chat })))

type ChatLazyProps = ComponentProps<typeof Chat>

export function ChatLazy(props: ChatLazyProps) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full">Loading chat...</div>}>
      <ChatComponent {...props} />
    </Suspense>
  )
}
