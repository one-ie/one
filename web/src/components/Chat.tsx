import { useState, useRef, useEffect } from 'react'
import { emitClick } from '@/lib/ui-signal'

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
  const [streaming, setStreaming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || streaming) return
    const userMessage = input.trim()
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
        setMessages([...nextHistory, { role: 'assistant', content: body.error ?? 'Error' }])
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
              setMessages([...nextHistory, { role: 'assistant', content: acc }])
            }
          } catch {
            // skip malformed chunk
          }
        }
      }
    } catch {
      setMessages([...nextHistory, { role: 'assistant', content: 'Connection error.' }])
    } finally {
      setStreaming(false)
    }
  }

  const containerClass = fullPage
    ? 'flex flex-col h-[calc(100vh-73px)] max-w-3xl mx-auto'
    : 'flex flex-col h-[500px] w-[380px]'

  return (
    <div className={containerClass}>
      {!fullPage && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900">
          <span className="font-medium">Chat with ONE</span>
          {onClose && (
            <button
              onClick={() => { emitClick('ui:chat:close'); onClose() }}
              aria-label="Close chat"
              className="text-zinc-400 hover:text-white"
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
          <div className="text-center text-zinc-500 py-8">
            <p className="text-lg mb-2">Hello!</p>
            <p className="text-sm">Ask me anything about ONE.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl whitespace-pre-wrap ${
                msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-100'
              }`}
            >
              {msg.content || (streaming && i === messages.length - 1 ? '…' : '')}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-zinc-800">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            emitClick('ui:chat:send', { length: input.length })
            send()
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
