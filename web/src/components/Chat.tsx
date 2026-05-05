import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { EyeOff, LayoutPanelLeft, MessageCircle, PanelRightOpen, X } from 'lucide-react'
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { TooltipProvider } from '@/components/ui/tooltip'
import { emitClick } from '@/lib/ui-signal'
import { getAgentMeta, listAgentsMeta } from '@/lib/agents-meta'
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import {
  PromptInput,
  PromptInputBody,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input'
import type { FileUIPart, UIMessage } from 'ai'

const MessageList = lazy(() =>
  import('@/components/chat/MessageList').then((m) => ({ default: m.MessageList })),
)
const VoiceMenu = lazy(() =>
  import('@/components/chat/VoiceMenu').then((m) => ({ default: m.VoiceMenu })),
)
const AddMenu = lazy(() =>
  import('@/components/chat/AddMenu').then((m) => ({ default: m.AddMenu })),
)
const PayPanel = lazy(() => import('@/components/pay/PayPanel').then(m => ({ default: m.PayPanel })))
const AttachmentsPreview = lazy(() =>
  import('@/components/chat/AttachmentsPreview').then((m) => ({ default: m.AttachmentsPreview })),
)
const SpeechInput = lazy(() =>
  import('@/components/ai-elements/speech-input').then((m) => ({ default: m.SpeechInput })),
)
const Shimmer = lazy(() =>
  import('@/components/ai-elements/shimmer').then((m) => ({ default: m.Shimmer })),
)

type ChatMode = 'wide' | 'rail' | 'icon' | 'none'

interface Props {
  fullPage?: boolean
  mode?: 'popover' | 'rail-25' | 'rail-45'
  onClose?: () => void
  onModeChange?: (m: ChatMode) => void
  currentMode?: ChatMode
  canSwitch?: boolean
  group?: string
  slug?: string
}

const DEFAULT_STARTERS = [
  'What is ONE?',
  'Show highways',
  'How do I sell a skill?',
  'How do I buy?',
  'Show pricing',
]

type VoiceId = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
const DEFAULT_VOICE: VoiceId = 'alloy'
const VALID_VOICES: ReadonlySet<VoiceId> = new Set([
  'alloy',
  'echo',
  'fable',
  'onyx',
  'nova',
  'shimmer',
])


function getMessageText(msg: UIMessage): string {
  return msg.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('\n\n')
    .trim()
}

export function Chat({ fullPage, mode = 'popover', onClose, onModeChange, currentMode, canSwitch, group = 'default', slug }: Props) {
  const [agentId, setAgentId] = useState<string | undefined>(undefined)

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('agent') ?? undefined
    setAgentId(id)
  }, [])

  const agentMeta = getAgentMeta(agentId)
  const allAgents = listAgentsMeta()
  const starters = agentMeta.starters.length > 0 ? agentMeta.starters : DEFAULT_STARTERS

  const { messages, sendMessage, addToolApprovalResponse, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat', body: { group, agentId, slug } }),
  })

  const [voice, setVoice] = useState<VoiceId>(DEFAULT_VOICE)
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [speakFor, setSpeakFor] = useState<{ id: string; url: string } | null>(null)
  const [ttsAvailable, setTtsAvailable] = useState(false)
  const [ttsProvider, setTtsProvider] = useState<'openai' | 'cf' | null>(null)
  const sendStartRef = useRef<number>(0)
  const [showPay, setShowPay] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = window.localStorage.getItem('chat:voice') as VoiceId | null
    if (saved && VALID_VOICES.has(saved)) setVoice(saved)
    const probe = () =>
      fetch('/api/tts')
        .then((r) => (r.ok ? r.json() : { available: false, provider: null }))
        .then((j: { available?: boolean; provider?: 'openai' | 'cf' | null }) => {
          setTtsAvailable(Boolean(j.available))
          setTtsProvider(j.provider ?? null)
        })
        .catch(() => {
          setTtsAvailable(false)
          setTtsProvider(null)
        })
    const ric = (window as typeof window & {
      requestIdleCallback?: (cb: () => void) => number
    }).requestIdleCallback
    if (ric) ric(probe)
    else setTimeout(probe, 1500)
    fetch('/api/chat', { method: 'GET' }).catch(() => {})
    fetch('/api/chat/warmup', { method: 'POST' }).catch(() => {})
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') window.localStorage.setItem('chat:voice', voice)
  }, [voice])

  useEffect(() => {
    if (status === 'submitted') sendStartRef.current = performance.now()
    if (status === 'streaming' && sendStartRef.current) {
      const ttft = performance.now() - sendStartRef.current
      emitClick('ui:chat:ttft', { ms: ttft })
      sendStartRef.current = 0
    }
  }, [status])

  useEffect(() => {
    if (showPay) return
    const last = messages[messages.length - 1]
    if (last?.role !== 'user') return
    if (/\b(buy|upgrade|pay|subscribe|pricing|plans?)\b/i.test(getMessageText(last))) setShowPay(true)
  }, [messages, showPay])

  // Consume ?q= once after mount and submit it (suggestion-button progressive enhancement)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q')
    if (!q) return
    params.delete('q')
    const next = params.toString()
    window.history.replaceState(
      null,
      '',
      window.location.pathname + (next ? `?${next}` : '') + window.location.hash,
    )
    sendMessage({ text: q })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(
    () => () => {
      if (speakFor) URL.revokeObjectURL(speakFor.url)
    },
    [speakFor],
  )

  // T4-P16: fire warmup on textarea focus so the worker is warm when user submits
  const warnedRef = useRef(false)
  const openSpeculative = useCallback(() => {
    if (warnedRef.current) return
    warnedRef.current = true
    fetch('/api/chat/warmup', { method: 'POST' }).catch(() => {})
  }, [])

  const speak = async (msg: UIMessage) => {
    const text = getMessageText(msg)
    if (!text) return
    emitClick('ui:chat:speak', { voice })
    if (speakFor?.id === msg.id) {
      URL.revokeObjectURL(speakFor.url)
      setSpeakFor(null)
      return
    }
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice }),
      })
      if (!res.ok) {
        console.error('tts failed', res.status, await res.text().catch(() => ''))
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setSpeakFor((prev) => {
        if (prev) URL.revokeObjectURL(prev.url)
        return { id: msg.id, url }
      })
    } catch (e) {
      console.error('tts error', e)
    }
  }

  const containerClass = fullPage
    ? 'flex flex-col h-full max-w-3xl mx-auto text-base'
    : mode === 'rail-45'
    ? 'flex flex-col h-full text-base'
    : mode === 'rail-25'
    ? 'flex flex-col h-full text-sm'
    : 'flex flex-col h-[500px] w-[380px] text-base'

  const submit = (text: string, files?: FileUIPart[]) => {
    if (status === 'submitted' || status === 'streaming') return
    const trimmed = text.trim()
    if (!trimmed && (!files || files.length === 0)) return
    emitClick('ui:chat:send')
    sendMessage({ text: trimmed, files })
  }

  const lastMsg = messages[messages.length - 1]
  const lastIsAssistantStreaming =
    lastMsg?.role === 'assistant' &&
    lastMsg.parts.some((p) => p.type === 'text' || p.type === 'reasoning')
  const showThinking = status === 'submitted' && !lastIsAssistantStreaming
  const showVoiceMenu = ttsAvailable && ttsProvider === 'openai'

  return (
    <>
      <style>{`.chat-prompt [data-slot="input-group"]{border:none!important;box-shadow:none!important;outline:none!important}.chat-prompt textarea{border:none!important;box-shadow:none!important;outline:none!important}`}</style>
      <TooltipProvider>
        <div className={containerClass}>
          {!fullPage && (mode === 'popover' || canSwitch) && (
            <div
              className="flex items-center justify-between px-3 py-2 bg-background border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <span className="font-medium text-sm">Chat</span>
              <div className="flex items-center gap-0.5">
                {canSwitch && onModeChange && (
                  <>
                    <button
                      onClick={() => { emitClick('ui:layout:mode-switch'); onModeChange('wide') }}
                      className={`p-1.5 rounded-md transition-colors ${currentMode === 'wide' ? 'bg-primary text-on-primary' : 'text-font/60 hover:text-font'}`}
                      title="Wide"
                    >
                      <LayoutPanelLeft size={14} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => { emitClick('ui:layout:mode-switch'); onModeChange('rail') }}
                      className={`p-1.5 rounded-md transition-colors ${currentMode === 'rail' ? 'bg-primary text-on-primary' : 'text-font/60 hover:text-font'}`}
                      title="Rail"
                    >
                      <PanelRightOpen size={14} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => { emitClick('ui:layout:mode-switch'); onModeChange('icon') }}
                      className="p-1.5 rounded-md transition-colors text-font/60 hover:text-font"
                      title="Minimize"
                    >
                      <MessageCircle size={14} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => { emitClick('ui:layout:mode-switch'); onModeChange('none') }}
                      className="p-1.5 rounded-md transition-colors text-font/60 hover:text-font"
                      title="Dismiss"
                    >
                      <EyeOff size={14} strokeWidth={1.5} />
                    </button>
                  </>
                )}
                {mode === 'popover' && onClose && (
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
            </div>
          )}

          <Conversation className="flex-1">
            <ConversationContent className="p-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-6 py-12">
                  <img
                    src="/icon.svg"
                    alt=""
                    aria-hidden
                    width={64}
                    height={64}
                    className="rounded-2xl"
                    fetchPriority="high"
                    decoding="async"
                  />
                  <div className="text-center">
                    <p className="text-lg mb-1">Hello!</p>
                    <p className="text-sm text-font/60">{agentMeta.description}</p>
                  </div>

                  {allAgents.length > 1 && (
                    <div className="w-full max-w-2xl px-6 overflow-x-auto">
                      <div className="flex gap-3 pb-1 justify-center">
                        {allAgents.map((a, i) => {
                          const isActive = a.id === agentMeta.id
                          const href = i === 0 ? '/chat' : `/chat?agent=${a.id}`
                          const tones = ['primary', 'secondary', 'tertiary'] as const
                          const tone = tones[i % tones.length]
                          return (
                            <a
                              key={a.id}
                              href={href}
                              className="shrink-0 flex items-start gap-3 p-3 rounded-xl border w-44 transition-colors no-underline"
                              style={{
                                borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                                background: 'var(--color-foreground)',
                              }}
                              onClick={() => emitClick('ui:chat:agent-select', { agentId: a.id })}
                            >
                              <span
                                className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 bg-${tone} text-on-${tone}`}
                              >
                                {a.name.slice(0, 1).toUpperCase()}
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{a.title}</p>
                                <p className="text-xs text-font/50 leading-tight line-clamp-2 mt-0.5">{a.description}</p>
                              </div>
                            </a>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <form
                    method="get"
                    action="/chat"
                    className="flex flex-wrap justify-center items-center gap-2 px-6 py-2 max-w-2xl mx-auto"
                    onSubmit={(e) => {
                      const submitter = (e.nativeEvent as SubmitEvent).submitter as
                        | HTMLButtonElement
                        | null
                      const text = submitter?.value
                      if (!text) return
                      e.preventDefault()
                      emitClick('ui:chat:suggestion', { text })
                      submit(text)
                    }}
                  >
                    {starters.map((s) => (
                      <button
                        key={s}
                        type="submit"
                        name="q"
                        value={s}
                        className="border h-auto px-5 py-3 text-base rounded-2xl hover:bg-foreground transition cursor-pointer"
                        style={{ borderColor: 'var(--color-border)' }}
                      >
                        {s}
                      </button>
                    ))}
                  </form>
                </div>
              )}

              {messages.length > 0 && (
                <Suspense fallback={null}>
                  <MessageList
                    messages={messages}
                    status={status}
                    speakFor={speakFor}
                    ttsAvailable={ttsAvailable}
                    slug={slug}
                    onIterateEval={(prompt) => sendMessage({ text: prompt })}
                    onSpeak={speak}
                    onApproval={addToolApprovalResponse}
                  />
                </Suspense>
              )}

              {showThinking && (
                <div className="flex items-center gap-3 text-font/60">
                  <img
                    src="/icon.svg"
                    alt=""
                    aria-hidden
                    width={28}
                    height={28}
                    className="rounded-md animate-pulse"
                  />
                  <Suspense fallback={<span className="text-font/60">Thinking…</span>}>
                    <Shimmer>Thinking…</Shimmer>
                  </Suspense>
                </div>
              )}
              {status === 'submitted' && (
                <div className="flex gap-3 px-4 py-3">
                  <div className="w-6 h-6 rounded-full bg-foreground shrink-0" />
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="h-3 bg-foreground rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-foreground rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              )}
              {showPay && (
                <Suspense fallback={null}>
                  <PayPanel onComplete={(piId) => sendMessage({ text: `Payment ${piId} confirmed — plan activates shortly.` })} />
                </Suspense>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <div className="px-4 pb-4 pt-3">
            <div className="chat-prompt rounded-xl bg-background overflow-hidden">
              <PromptInput
                multiple
                globalDrop
                className="[&>div]:h-auto [&>div]:items-end [&>div]:border-0 [&>div]:shadow-none [&>div]:outline-none"
                onSubmit={({ text, files }) => submit(text, files)}
              >
                <Suspense fallback={null}>
                  <AttachmentsPreview />
                </Suspense>
                <Suspense
                  fallback={
                    <div className="inline-flex self-end pb-2 pl-2" aria-hidden>
                      <div className="size-9 rounded-full bg-foreground" />
                    </div>
                  }
                >
                  <AddMenu />
                </Suspense>
                <PromptInputBody>
                  <PromptInputTextarea
                    placeholder="Type a message…"
                    rows={5}
                    style={{ minHeight: '120px', paddingTop: '20px' }}
                    className="text-lg focus-visible:ring-0 focus-visible:border-0 focus-visible:outline-none border-0"
                    onFocus={openSpeculative}
                  />
                </PromptInputBody>
                <PromptInputTools>
                  {showVoiceMenu && (
                    <Suspense fallback={null}>
                      <VoiceMenu
                        open={voiceOpen}
                        onOpenChange={setVoiceOpen}
                        voice={voice}
                        onVoiceChange={setVoice}
                      />
                    </Suspense>
                  )}
                  <Suspense fallback={<div className="size-9 rounded-full" />}>
                    <SpeechInput
                      aria-label="Voice input"
                      variant="ghost"
                      size="icon-sm"
                      className="!size-9 !rounded-full [&_svg]:!size-4"
                      onTranscriptionChange={(text) => {
                        emitClick('ui:chat:voice', { text })
                        submit(text)
                      }}
                    />
                  </Suspense>
                  <PromptInputSubmit
                    status={status}
                    onStop={stop}
                    className="!size-9 !rounded-full [&>svg]:!size-4"
                  />
                </PromptInputTools>
              </PromptInput>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </>
  )
}
