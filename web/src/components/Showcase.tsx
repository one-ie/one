import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { lazy, Suspense, useEffect, useState } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { emitClick } from '@/lib/ui-signal'
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
  usePromptInputAttachments,
} from '@/components/ai-elements/prompt-input'
import { Shimmer } from '@/components/ai-elements/shimmer'
import { Attachment, Attachments, AttachmentPreview, AttachmentRemove } from '@/components/ai-elements/attachments'
import { SpeechInput } from '@/components/ai-elements/speech-input'
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

interface Props {
  group?: string
}

interface StarterCategory {
  label: string
  starters: string[]
}

const STARTER_CATEGORIES: StarterCategory[] = [
  {
    label: 'Explore ONE',
    starters: [
      'What is ONE?',
      'Show me the signal highways',
      'How do I sell a skill?',
      'How do I buy?',
    ],
  },
  {
    label: 'See it think',
    starters: [
      'Explain how pheromone routing works',
      'Walk me through a signal step by step',
    ],
  },
  {
    label: 'Code & files',
    starters: [
      'Show a TypeScript ONE signal handler',
      'Show the schema for a path entity',
      'List the agent files in this repo',
    ],
  },
  {
    label: 'Actions',
    starters: ['Confirm: reset my session'],
  },
  {
    label: 'Citations',
    starters: ['Where does ONE store knowledge?'],
  },
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

function AttachmentsPreview() {
  const attachments = usePromptInputAttachments()
  if (attachments.files.length === 0) return null
  return (
    <PromptInputHeader>
      <Attachments variant="inline">
        {attachments.files.map((a) => (
          <Attachment data={a} key={a.id} onRemove={() => attachments.remove(a.id)}>
            <AttachmentPreview />
            <AttachmentRemove />
          </Attachment>
        ))}
      </Attachments>
    </PromptInputHeader>
  )
}

function getMessageText(msg: UIMessage): string {
  return msg.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('\n\n')
    .trim()
}

export function Showcase({ group = 'default' }: Props) {
  const { messages, sendMessage, addToolApprovalResponse, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat', body: { group } }),
  })

  const [voice, setVoice] = useState<VoiceId>(DEFAULT_VOICE)
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [speakFor, setSpeakFor] = useState<{ id: string; url: string } | null>(null)
  const [ttsAvailable, setTtsAvailable] = useState(false)
  const [ttsProvider, setTtsProvider] = useState<'openai' | 'cf' | null>(null)

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
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') window.localStorage.setItem('chat:voice', voice)
  }, [voice])

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
        <div className="flex flex-col h-full max-w-3xl mx-auto text-base">
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
                  />
                  <div className="text-center">
                    <p className="text-lg mb-1">Hello!</p>
                    <p className="text-sm text-font/60">Ask me anything about ONE.</p>
                  </div>
                  <form
                    method="get"
                    action="/showcase"
                    className="flex flex-col gap-6 px-6 py-2 max-w-2xl mx-auto w-full"
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
                    {STARTER_CATEGORIES.map((cat) => (
                      <div key={cat.label} className="w-full">
                        <p className="text-xs text-font/60 uppercase tracking-wide mb-2 text-left">
                          {cat.label}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {cat.starters.slice(0, 4).map((s) => (
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
                          {cat.starters.length > 4 && (
                            <details>
                              <summary
                                className="border h-auto px-5 py-3 text-base rounded-2xl hover:bg-foreground transition cursor-pointer list-none text-font/60"
                                style={{ borderColor: 'var(--color-border)' }}
                              >
                                +{cat.starters.length - 4} more
                              </summary>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {cat.starters.slice(4).map((s) => (
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
                              </div>
                            </details>
                          )}
                        </div>
                      </div>
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
                  <Shimmer>Thinking…</Shimmer>
                </div>
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
                <AttachmentsPreview />
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
