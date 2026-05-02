import { useState, useRef, useEffect } from 'react'
import { X, Send } from 'lucide-react'
import { Icon } from '@/components/ui/Icon'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { emitClick } from '@/lib/ui-signal'

interface Props {
  fullPage?: boolean
  onClose?: () => void
  group?: string
}

export function Chat({ fullPage = false, onClose, group = 'default' }: Props) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, addToolApprovalResponse, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat', body: { group } }),
  })

  const loading = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const send = () => {
    if (!input.trim() || loading) return
    emitClick('ui:chat:send')
    sendMessage({ text: input.trim() })
    setInput('')
  }

  const containerClass = fullPage
    ? 'flex flex-col h-[calc(100vh-73px)] max-w-3xl mx-auto'
    : 'flex flex-col h-[500px] w-[380px]'

  return (
    <div className={containerClass}>
      {!fullPage && (
        <div
          className="flex items-center justify-between px-4 py-3 bg-background border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <span className="font-medium text-sm">Chat with ONE</span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close chat"
              className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-font/60 hover:text-font hover:bg-foreground transition"
            >
              <Icon icon={X} size="md" />
            </button>
          )}
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-font/50 py-8">
            <p className="text-lg mb-2">Hello!</p>
            <p className="text-sm">Ask me anything about ONE.</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            {msg.parts.map((part, i) => {
              if (part.type === 'text') {
                return (
                  <div
                    key={i}
                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                      msg.role === 'user' ? 'bg-primary text-on-primary' : 'bg-foreground text-font'
                    }`}
                  >
                    {part.text}
                  </div>
                )
              }
              if (
                (part.type === 'dynamic-tool' || part.type.startsWith('tool-')) &&
                (part as { state?: string }).state === 'approval-requested'
              ) {
                const approvalPart = part as { type: string; state: string; input: unknown; approval: { id: string } }
                return (
                  <div
                    key={i}
                    className="bg-foreground border rounded-xl p-3 text-sm max-w-[80%]"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <p className="text-font/60 mb-2">Approve: <code>{approvalPart.type}</code>?</p>
                    <pre className="text-xs text-font/40 mb-2 overflow-auto">{JSON.stringify(approvalPart.input, null, 2)}</pre>
                    <div className="flex gap-2">
                      <button
                        className="bg-primary text-on-primary rounded-lg px-3 py-1.5 text-xs"
                        onClick={() => addToolApprovalResponse({ id: approvalPart.approval.id, approved: true })}
                      >
                        Approve
                      </button>
                      <button
                        className="bg-foreground border rounded-lg px-3 py-1.5 text-xs"
                        style={{ borderColor: 'var(--color-border)' }}
                        onClick={() => addToolApprovalResponse({ id: approvalPart.approval.id, approved: false })}
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                )
              }
              return null
            })}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-foreground px-4 py-2 rounded-2xl text-font/60 animate-pulse">Thinking...</div>
          </div>
        )}
      </div>

      <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <form onSubmit={(e) => { e.preventDefault(); send() }} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 px-4 py-2 bg-background text-font placeholder:text-font/50 rounded-lg border focus:outline-none transition"
            style={{ borderColor: 'var(--color-border)' }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className="w-10 h-10 inline-flex items-center justify-center bg-primary text-on-primary rounded-lg hover:brightness-110 disabled:opacity-50 transition"
          >
            <Icon icon={Send} size="md" />
          </button>
        </form>
      </div>
    </div>
  )
}
