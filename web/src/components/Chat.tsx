import { useState, useRef, useEffect } from 'react'
import { X, Send } from 'lucide-react'
import { Icon } from '@/components/ui/Icon'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  fullPage?: boolean
  onClose?: () => void
}

export function Chat({ fullPage = false, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: messages }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response || data.error || 'Error' }])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Connection error.' }])
    } finally {
      setLoading(false)
    }
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
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                msg.role === 'user' ? 'bg-primary text-on-primary' : 'bg-foreground text-font'
              }`}
            >
              {msg.content}
            </div>
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
