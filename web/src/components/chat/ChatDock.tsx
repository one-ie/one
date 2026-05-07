import { useEffect, useRef, useState } from 'react'
import { MessageSquare, Send, X } from 'lucide-react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { emitClick } from '@/lib/ui-signal'
import { useSurfaceContext } from '@/lib/surface-context'
import { Icon } from '@/components/ui/Icon'
import { extractChips } from '@/lib/chips'
import type { Chip } from '@/lib/chips'

export interface ChatDockProps {
  surface?: string
}

export function ChatDock({ surface: surfaceProp }: ChatDockProps) {
  const [open, setOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const [input, setInput] = useState('')
  const [starters, setStarters] = useState<string[]>([])
  const surfaceContext = useSurfaceContext()
  const surface = (surfaceProp as typeof surfaceContext.surface) ?? surfaceContext.surface ?? 'default'

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat', body: { group: surface } }),
  })

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, status])

  useEffect(() => {
    const lastMsg = messages[messages.length - 1]
    if (!open && lastMsg?.role === 'assistant') {
      setHasUnread(true)
    }
  }, [messages]) // eslint intentionally omits `open` — only trigger on new messages

  useEffect(() => {
    if (!open) return
    fetch(`/api/chat?group=${encodeURIComponent(surface)}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.starters)) {
          setStarters((data.starters as string[]).slice(0, 4))
        }
      })
      .catch(() => {/* fetch failed — starters stay empty */})
  }, [open, surface])

  const close = () => {
    emitClick('ui:dock:close')
    setOpen(false)
  }

  const toggle = () => {
    if (open) {
      close()
    } else {
      emitClick('ui:dock:open')
      emitClick('ui:dock:context-signal', {
        ...surfaceContext,
        surface,
      })
      setHasUnread(false)
      setOpen(true)
    }
  }

  const submit = () => {
    const trimmed = input.trim()
    if (!trimmed || status === 'submitted' || status === 'streaming') return
    emitClick('ui:dock:send')
    sendMessage({ text: trimmed })
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const isStreaming = status === 'streaming'

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          className="bg-background border rounded-2xl flex flex-col overflow-hidden"
          style={{
            width: '400px',
            maxHeight: '500px',
            borderColor: 'var(--color-border)',
            boxShadow: 'var(--shadow-pop)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <span className="text-sm font-medium text-font">Ask anything</span>
            <button
              onClick={close}
              className="text-font/60 hover:text-font transition-colors"
              aria-label="Close chat dock"
            >
              <Icon icon={X} size="sm" />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex flex-col gap-3 p-4 overflow-y-auto"
            style={{ maxHeight: '330px' }}
          >
            {messages.length === 0 && (
              starters.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 py-2">
                  {starters.map((starter) => (
                    <button
                      key={starter}
                      className="px-2.5 py-1 rounded-full text-xs border text-primary hover:bg-foreground transition-colors"
                      style={{ borderColor: 'var(--color-border)' }}
                      onClick={() => {
                        emitClick('ui:dock:starter', { starter, surface })
                        sendMessage({ text: starter })
                      }}
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-font/40 text-sm text-center py-4">Ask about this page…</p>
              )
            )}

            {messages.map((msg) => {
              const isUser = msg.role === 'user'
              return (
                <div key={msg.id} className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
                  {msg.parts.map((part, i) => {
                    if (typeof part.type === 'string' && part.type.startsWith('tool-')) {
                      const p = part as { type: string; state?: string; output?: unknown }
                      if (p.state === 'output-available') {
                        const toolName = p.type.replace(/^tool-/, '')
                        const res = p.output as { kind?: string; title?: string; ok?: boolean; agent_id?: string }
                        if (res?.kind === 'result') {
                          if (res.ok && toolName === 'patch_agent' && res.agent_id) {
                            window.dispatchEvent(new CustomEvent('agent:patched', { detail: { id: res.agent_id } }))
                          }
                          if (res.ok && toolName === 'patch_theme') {
                            window.dispatchEvent(new CustomEvent('theme:patched'))
                          }
                          return (
                            <div
                              key={i}
                              className={`px-3 py-1.5 rounded-lg text-xs border ${res.ok ? 'text-primary' : 'text-font/60'}`}
                              style={{ borderColor: 'var(--color-border)' }}
                            >
                              {res.ok ? '✓ ' : '✗ '}{res.title ?? 'Done'}
                            </div>
                          )
                        }
                      }
                      return null
                    }
                    if (part.type !== 'text') return null
                    const { text, chips } = extractChips(part.text)
                    return (
                      <div key={i} className="flex flex-col gap-2 max-w-[85%]">
                        <div
                          className={`px-3 py-2 rounded-xl text-sm ${
                            isUser
                              ? 'bg-primary text-on-primary'
                              : 'bg-foreground text-font border'
                          }`}
                          style={isUser ? {} : { borderColor: 'var(--color-border)' }}
                        >
                          {text}
                        </div>
                        {chips.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {chips.map((chip: Chip) => (
                              <button
                                key={chip.id}
                                className="px-2.5 py-1 rounded-full text-xs border text-primary hover:bg-foreground transition-colors"
                                style={{ borderColor: 'var(--color-border)' }}
                                onClick={() => {
                                  emitClick('ui:dock:chip', { chip: chip.id, surface })
                                  sendMessage({ text: chip.label })
                                }}
                              >
                                {chip.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}

            {isStreaming && (
              <div className="flex items-center gap-1.5 px-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="px-4 pb-4 pt-2">
            <div
              className="bg-foreground rounded-xl border flex items-end gap-2 p-2"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <textarea
                className="flex-1 bg-transparent text-font text-sm resize-none outline-none leading-relaxed py-1 px-1"
                placeholder="Ask about this page…"
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isStreaming}
              />
              <button
                onClick={() => { submit() }}
                disabled={!input.trim() || isStreaming}
                className="shrink-0 p-1.5 rounded-lg bg-primary text-on-primary disabled:opacity-40 transition-opacity"
                aria-label="Send"
              >
                <Icon icon={Send} size="sm" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <button
          onClick={() => { toggle() }}
          className="bg-primary text-on-primary rounded-full w-12 h-12 flex items-center justify-center"
          style={{ boxShadow: 'var(--shadow-pop)' }}
          aria-label={open ? 'Close chat' : 'Open chat'}
          aria-expanded={open}
        >
          <Icon icon={MessageSquare} size="md" />
        </button>
        {hasUnread && (
          <span
            className="absolute top-0 right-0 w-3 h-3 rounded-full bg-destructive border-2 border-background"
            aria-label="New messages"
          />
        )}
      </div>
    </div>
  )
}
