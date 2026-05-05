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
                  <svg width="64" height="64" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-2xl" aria-hidden="true">
                    <path fillRule="evenodd" clipRule="evenodd" d="M23.2679 37.7188C20.6983 37.7647 18.2761 37.2242 16.0013 36.0972C13.806 35.0219 11.9704 33.5023 10.4943 31.5383C8.40078 28.7362 7.3253 25.6505 7.26788 22.2813C7.19372 17.9304 8.6644 14.1955 11.68 11.0765C14.6955 7.95748 18.3795 6.35909 22.7321 6.28128C27.0846 6.20347 30.8209 7.66921 33.9409 10.6785C37.0609 13.6879 38.6579 17.3679 38.7321 21.7188C38.8062 26.0697 37.3356 29.8046 34.32 32.9236C31.3045 36.0426 27.6204 37.641 23.2679 37.7188ZM22.7287 31.4789L23.24 31.4697C25.8096 31.4238 27.9897 30.456 29.7804 28.5664C31.5711 26.6767 32.444 24.4187 32.3992 21.7922C32.3545 19.1658 31.4051 16.9403 29.5512 15.1158C27.6972 13.2913 25.4854 12.402 22.9158 12.448L22.4045 12.4571L22.41 12.7755L20.5221 12.8092C19.844 13.0336 19.2319 13.2834 18.6858 13.5586L22.4222 13.4918L22.429 13.8897L18.0633 13.9677C17.7518 14.1591 17.4281 14.4037 17.0922 14.7016L22.4412 14.606L22.4473 14.9642L16.6657 15.0675C16.3565 15.3915 16.1377 15.6342 16.0093 15.7958L22.4595 15.6805L22.4656 16.0386L15.7007 16.1595C15.5208 16.3751 15.3547 16.6301 15.2023 16.9248L22.4785 16.7947L22.4846 17.1529L14.9725 17.2871L14.6307 18.0098L22.4968 17.8692L22.5029 18.2273L14.4795 18.3707C14.4284 18.4513 14.3715 18.5783 14.3089 18.7519C14.2463 18.9256 14.2026 19.0524 14.1777 19.1325L22.5158 18.9834L22.5225 19.3813L14.1058 19.5318C14.081 19.6119 14.0502 19.7318 14.0136 19.8917C13.977 20.0516 13.9463 20.1716 13.9214 20.2516L22.5348 20.0976L22.5409 20.4558L13.8882 20.6105C13.8411 20.9298 13.819 21.169 13.8217 21.3282L22.5531 21.1721L22.5592 21.5303L13.7885 21.687L13.8014 22.4431L22.5721 22.2863L22.5782 22.6445L13.8075 22.8013C13.8088 22.8809 13.8174 23.0001 13.8332 23.1591C13.8491 23.318 13.8708 23.4371 13.8983 23.5162L22.5904 23.3608L22.5965 23.7189L13.9831 23.8729C14.041 24.1903 14.0975 24.4282 14.1526 24.5864L22.6087 24.4353L22.6155 24.8332L14.2774 24.9823L14.5256 25.6943L22.6277 25.5495L22.6338 25.9076L14.689 26.0497L15.0552 26.7596L22.646 26.6239L22.6521 26.9821L15.2973 27.1136C15.4591 27.3761 15.6205 27.612 15.7815 27.8214L22.6643 27.6984L22.6711 28.0963L16.0636 28.2145C16.1436 28.2927 16.2571 28.41 16.404 28.5666C16.5509 28.7232 16.6644 28.8406 16.7444 28.9188L22.6833 28.8126L22.6894 29.1708L17.1438 29.2699C17.463 29.5296 17.7817 29.7627 18.0999 29.9694L22.7016 29.8871L22.7077 30.2453L18.696 30.317C19.1463 30.5743 19.6485 30.8042 20.2028 31.0066L22.7199 30.9616L22.7287 31.4789Z" fill="white"/>
                  </svg>
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
