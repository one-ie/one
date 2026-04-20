import { useState, useRef, useEffect } from 'react'
import { emitClick } from '@/lib/ui-signal'

interface Message {
  role: 'user' | 'assistant'
  content: string
  error?: boolean
}

interface Props {
  fullPage?: boolean
  onClose?: () => void
}

const SUGGESTIONS = [
  'How does ONE work?',
  'Deploy an agent to Telegram',
  'What\'s the marketplace?',
]

export function Chat({ fullPage = false, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: streaming ? 'auto' : 'smooth' })
  }, [messages, streaming])

  const submit = async (raw: string) => {
    const userMessage = raw.trim()
    if (!userMessage || streaming) return
    setInput('')
    const nextHistory: Message[] = [...messages, { role: 'user', content: userMessage }]
    setMessages([...nextHistory, { role: 'assistant', content: '' }])
    setStreaming(true)

    try {
      const res = await fetch('/api/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: messages }),
      })

      if (!res.ok || !res.body) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        setMessages([...nextHistory, { role: 'assistant', content: body.error ?? 'Error', error: true }])
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      let acc = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })

        let sep: number
        while ((sep = buf.indexOf('\n\n')) !== -1) {
          const raw = buf.slice(0, sep)
          buf = buf.slice(sep + 2)
          const lines = raw.split('\n')
          let event = 'message'
          let data = ''
          for (const line of lines) {
            if (line.startsWith('event: ')) event = line.slice(7)
            else if (line.startsWith('data: ')) data += line.slice(6)
          }
          if (!data) continue
          try {
            const payload = JSON.parse(data) as { text?: string; error?: string }
            if (event === 'delta' && payload.text) {
              acc += payload.text
              setMessages([...nextHistory, { role: 'assistant', content: acc }])
            } else if (event === 'replace' && payload.text) {
              acc = payload.text
              setMessages([...nextHistory, { role: 'assistant', content: acc }])
            } else if (event === 'error') {
              acc = payload.error ?? 'Error'
              setMessages([...nextHistory, { role: 'assistant', content: acc, error: true }])
            }
          } catch {
            // skip malformed chunk
          }
        }
      }
    } catch {
      setMessages([...nextHistory, { role: 'assistant', content: 'Connection error.', error: true }])
    } finally {
      setStreaming(false)
      inputRef.current?.focus()
    }
  }

  const pick = (prompt: string) => {
    emitClick('ui:chat:suggest', { prompt })
    submit(prompt)
  }

  const containerClass = fullPage
    ? 'flex flex-col h-[calc(100dvh-73px)] max-w-3xl mx-auto'
    : 'flex flex-col h-[min(500px,calc(100dvh-7rem))] w-[min(380px,calc(100vw-2rem))]'

  return (
    <div className={containerClass}>
      {!fullPage && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900">
          <span className="font-medium">Chat with ONE</span>
          {onClose && (
            <button
              onClick={() => { emitClick('ui:chat:close'); onClose() }}
              aria-label="Close chat"
              className="text-zinc-400 hover:text-white rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-lg mb-2 text-zinc-300">Hello!</p>
            <p className="text-sm text-zinc-400 mb-6">Ask me anything about ONE.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => pick(s)}
                  className="px-3 py-1.5 text-sm bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-full hover:bg-zinc-700 hover:border-zinc-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => {
          const isLastAssistant = msg.role === 'assistant' && i === messages.length - 1
          const showDots = isLastAssistant && streaming && !msg.content
          return (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : msg.error
                    ? 'bg-red-950/60 border border-red-900 text-red-100'
                    : 'bg-zinc-800 text-zinc-100'
                }`}
              >
                {msg.error && <span className="mr-1.5" aria-hidden>⚠</span>}
                {msg.content}
                {showDots && (
                  <span className="inline-flex gap-1 align-middle" aria-label="Assistant is typing">
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="p-4 border-t border-zinc-800">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            emitClick('ui:chat:send', { length: input.length })
            submit(input)
          }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            aria-label="Message"
            className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-400"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
