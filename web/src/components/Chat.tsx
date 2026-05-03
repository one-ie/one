import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Volume2, X, Wrench, AlertCircle } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'
import { TooltipProvider } from '@/components/ui/tooltip'
import { emitClick } from '@/lib/ui-signal'
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input'
import { Tool, ToolHeader } from '@/components/ai-elements/tool'
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion'
import {
  CodeBlock,
  CodeBlockCopyButton,
} from '@/components/ai-elements/code-block'
import { Shimmer } from '@/components/ai-elements/shimmer'
import { Message } from '@/components/ai-elements/message'
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning'
import {
  Attachment,
  Attachments,
  AttachmentInfo,
  AttachmentPreview,
} from '@/components/ai-elements/attachments'
import { SpeechInput } from '@/components/ai-elements/speech-input'
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from '@/components/ai-elements/chain-of-thought'
import {
  AudioPlayer,
  AudioPlayerControlBar,
  AudioPlayerDurationDisplay,
  AudioPlayerElement,
  AudioPlayerMuteButton,
  AudioPlayerPlayButton,
  AudioPlayerTimeDisplay,
  AudioPlayerTimeRange,
} from '@/components/ai-elements/audio-player'
import {
  VoiceSelector,
  VoiceSelectorContent,
  VoiceSelectorEmpty,
  VoiceSelectorGroup,
  VoiceSelectorInput,
  VoiceSelectorItem,
  VoiceSelectorList,
  VoiceSelectorTrigger,
} from '@/components/ai-elements/voice-selector'
import { Button } from '@/components/ui/button'
import type { DynamicToolUIPart, FileUIPart, ToolUIPart, UIMessage } from 'ai'
import type { BundledLanguage } from 'shiki'

interface Props {
  fullPage?: boolean
  onClose?: () => void
  group?: string
}

const STARTERS = [
  'What is ONE?',
  'Show highways',
  'How do I sell a skill?',
  'How do I buy?',
] as const

const VOICES = [
  { id: 'alloy', label: 'Alloy', desc: 'Neutral, balanced' },
  { id: 'echo', label: 'Echo', desc: 'Warm, conversational' },
  { id: 'fable', label: 'Fable', desc: 'British, expressive' },
  { id: 'onyx', label: 'Onyx', desc: 'Deep, authoritative' },
  { id: 'nova', label: 'Nova', desc: 'Bright, friendly' },
  { id: 'shimmer', label: 'Shimmer', desc: 'Soft, calm' },
] as const

type VoiceId = (typeof VOICES)[number]['id']
const DEFAULT_VOICE: VoiceId = 'alloy'

const FENCE = /```(\w+)?\n([\s\S]*?)```/g

function isToolPart(p: UIMessage['parts'][number]): p is ToolUIPart | DynamicToolUIPart {
  return p.type === 'dynamic-tool' || p.type.startsWith('tool-')
}

function toolStepStatus(state: string | undefined): 'active' | 'complete' | 'pending' {
  if (state === 'output-available' || state === 'output-error') return 'complete'
  if (
    state === 'input-streaming' ||
    state === 'input-available' ||
    state === 'executing' ||
    state === 'approval-requested'
  )
    return 'active'
  return 'pending'
}

function toolStepLabel(p: ToolUIPart | DynamicToolUIPart): string {
  const name = 'toolName' in p ? p.toolName : p.type.replace(/^tool-/, '')
  const state = (p as { state?: string }).state
  if (state === 'output-error') return `${name} — failed`
  if (state === 'approval-requested') return `${name} — needs approval`
  if (state === 'output-available') return `${name}`
  return `${name}…`
}

function getMessageText(msg: UIMessage): string {
  return msg.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('\n\n')
    .trim()
}

function renderTextWithCode(text: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let i = 0
  for (const m of text.matchAll(FENCE)) {
    const start = m.index ?? 0
    if (start > last) out.push(<span key={`t-${i}`}>{text.slice(last, start)}</span>)
    const lang = (m[1] || 'text') as BundledLanguage
    const code = m[2] ?? ''
    out.push(
      <CodeBlock key={`c-${i}`} code={code} language={lang} className="my-2">
        <div className="absolute right-2 top-2">
          <CodeBlockCopyButton onCopy={() => emitClick('ui:chat:copy')} />
        </div>
      </CodeBlock>,
    )
    last = start + m[0].length
    i++
  }
  if (last < text.length) out.push(<span key={`t-${i}`}>{text.slice(last)}</span>)
  return out
}

export function Chat({ fullPage = false, onClose, group = 'default' }: Props) {
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
    if (saved && VOICES.some((v) => v.id === saved)) setVoice(saved)
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
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') window.localStorage.setItem('chat:voice', voice)
  }, [voice])

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

  const containerClass = fullPage
    ? 'flex flex-col h-full max-w-3xl mx-auto text-base'
    : 'flex flex-col h-[500px] w-[380px] text-base'

  const submit = (text: string, files?: FileUIPart[]) => {
    if (!text.trim() || status === 'submitted' || status === 'streaming') return
    emitClick('ui:chat:send')
    sendMessage({ text: text.trim(), files })
  }

  const lastMsg = messages[messages.length - 1]
  const lastIsAssistantStreaming =
    lastMsg?.role === 'assistant' && lastMsg.parts.some((p) => p.type === 'text' || p.type === 'reasoning')
  const showThinking = status === 'submitted' && !lastIsAssistantStreaming

  return (
    <>
      <style>{`.chat-prompt [data-slot="input-group"]{border:none!important;box-shadow:none!important;outline:none!important}.chat-prompt textarea{border:none!important;box-shadow:none!important;outline:none!important}`}</style>
      <TooltipProvider>
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
                  <Suggestions className="justify-center">
                    {STARTERS.map((s) => (
                      <Suggestion
                        key={s}
                        suggestion={s}
                        onClick={(text) => {
                          emitClick('ui:chat:suggestion', { text })
                          submit(text)
                        }}
                      />
                    ))}
                  </Suggestions>
                </div>
              )}

              {messages.map((msg) => {
                const fileParts = msg.parts.filter((p) => p.type === 'file') as FileUIPart[]
                const toolParts = msg.parts.filter(isToolPart)
                const anyActive = toolParts.some(
                  (p) => toolStepStatus((p as { state?: string }).state) === 'active',
                )
                const hasText = msg.parts.some((p) => p.type === 'text')
                const speakingHere = speakFor?.id === msg.id
                return (
                  <Message key={msg.id} from={msg.role}>
                    <div className="flex flex-col gap-2 max-w-[80%] ml-auto data-[from=assistant]:ml-0">
                      {fileParts.length > 0 && (
                        <Attachments variant={msg.role === 'user' ? 'grid' : 'list'}>
                          {fileParts.map((f, i) => (
                            <Attachment
                              key={`${msg.id}-f-${i}`}
                              data={{ ...f, id: `${msg.id}-f-${i}` }}
                            >
                              <AttachmentPreview />
                              <AttachmentInfo />
                            </Attachment>
                          ))}
                        </Attachments>
                      )}
                      {msg.role === 'assistant' && toolParts.length > 0 && (
                        <ChainOfThought defaultOpen={anyActive}>
                          <ChainOfThoughtHeader>
                            {anyActive
                              ? `Working — ${toolParts.length} step${toolParts.length === 1 ? '' : 's'}`
                              : `Used ${toolParts.length} tool${toolParts.length === 1 ? '' : 's'}`}
                          </ChainOfThoughtHeader>
                          <ChainOfThoughtContent>
                            {toolParts.map((p, i) => {
                              const state = (p as { state?: string }).state
                              const status = toolStepStatus(state)
                              const errored = state === 'output-error'
                              return (
                                <ChainOfThoughtStep
                                  key={`${msg.id}-cot-${i}`}
                                  icon={errored ? AlertCircle : Wrench}
                                  label={toolStepLabel(p)}
                                  status={status}
                                />
                              )
                            })}
                          </ChainOfThoughtContent>
                        </ChainOfThought>
                      )}
                      {msg.parts.map((part, i) => {
                        if (part.type === 'text') {
                          return msg.role === 'user' ? (
                            <div
                              key={i}
                              className="ml-auto px-4 py-2 rounded-2xl bg-foreground text-font"
                            >
                              {part.text}
                            </div>
                          ) : (
                            <div key={i} className="text-font">
                              {renderTextWithCode(part.text)}
                            </div>
                          )
                        }
                        if (part.type === 'reasoning') {
                          return (
                            <Reasoning key={i} isStreaming={status === 'streaming'}>
                              <ReasoningTrigger />
                              <ReasoningContent>{part.text}</ReasoningContent>
                            </Reasoning>
                          )
                        }
                        if (
                          (part.type === 'dynamic-tool' || part.type.startsWith('tool-')) &&
                          (part as { state?: string }).state === 'approval-requested'
                        ) {
                          const toolPart = part as ToolUIPart | DynamicToolUIPart
                          const approvalId =
                            (toolPart as { approval?: { id: string } }).approval?.id ?? ''
                          const toolName =
                            'toolName' in toolPart ? toolPart.toolName : toolPart.type
                          return (
                            <Tool key={i}>
                              <ToolHeader
                                type={toolPart.type as DynamicToolUIPart['type']}
                                state={toolPart.state as DynamicToolUIPart['state']}
                                toolName={toolName}
                              />
                              <div className="flex gap-2 p-3">
                                <button
                                  type="button"
                                  className="bg-primary text-on-primary rounded-lg px-3 py-1.5 text-xs"
                                  onClick={() => {
                                    emitClick('ui:chat:tool-approve')
                                    addToolApprovalResponse({ id: approvalId, approved: true })
                                  }}
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  className="bg-foreground border rounded-lg px-3 py-1.5 text-xs"
                                  style={{ borderColor: 'var(--color-border)' }}
                                  onClick={() => {
                                    emitClick('ui:chat:tool-deny')
                                    addToolApprovalResponse({ id: approvalId, approved: false })
                                  }}
                                >
                                  Deny
                                </button>
                              </div>
                            </Tool>
                          )
                        }
                        return null
                      })}
                      {msg.role === 'assistant' && hasText && ttsAvailable && (
                        <div className="flex items-center gap-2 mt-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-font/60 hover:text-font"
                            onClick={() => speak(msg)}
                          >
                            <Volume2 className="size-3.5 mr-1.5" />
                            {speakingHere ? 'Stop' : 'Speak'}
                          </Button>
                        </div>
                      )}
                      {speakingHere && (
                        <AudioPlayer className="mt-1 rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
                          <AudioPlayerElement src={speakFor.url} autoPlay />
                          <AudioPlayerControlBar>
                            <AudioPlayerPlayButton />
                            <AudioPlayerTimeRange />
                            <AudioPlayerTimeDisplay />
                            <AudioPlayerDurationDisplay />
                            <AudioPlayerMuteButton />
                          </AudioPlayerControlBar>
                        </AudioPlayer>
                      )}
                    </div>
                  </Message>
                )
              })}

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
                className="[&>div]:h-auto [&>div]:items-end [&>div]:border-0 [&>div]:shadow-none [&>div]:outline-none"
                onSubmit={({ text, files }) => submit(text, files)}
              >
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger tooltip="Add files" />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
                <PromptInputBody>
                  <PromptInputTextarea
                    placeholder="Type a message…"
                    rows={5}
                    style={{ minHeight: '120px', paddingTop: '20px' }}
                    className="focus-visible:ring-0 focus-visible:border-0 focus-visible:outline-none border-0"
                  />
                </PromptInputBody>
                <PromptInputTools>
                  {ttsAvailable && ttsProvider === 'openai' && (
                  <VoiceSelector
                    open={voiceOpen}
                    onOpenChange={setVoiceOpen}
                    value={voice}
                    onValueChange={(v) => v && setVoice(v as VoiceId)}
                  >
                    <VoiceSelectorTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs gap-1.5"
                        onClick={() => emitClick('ui:chat:voice-open')}
                      >
                        <Volume2 className="size-3.5" />
                        {VOICES.find((v) => v.id === voice)?.label ?? 'Voice'}
                      </Button>
                    </VoiceSelectorTrigger>
                    <VoiceSelectorContent>
                      <VoiceSelectorInput placeholder="Search voices…" />
                      <VoiceSelectorList>
                        <VoiceSelectorEmpty>No voice found.</VoiceSelectorEmpty>
                        <VoiceSelectorGroup heading="OpenAI voices">
                          {VOICES.map((v) => (
                            <VoiceSelectorItem
                              key={v.id}
                              value={v.id}
                              onSelect={(value) => {
                                emitClick('ui:chat:voice-pick', { voice: value })
                                setVoice(value as VoiceId)
                                setVoiceOpen(false)
                              }}
                            >
                              <span className="font-medium">{v.label}</span>
                              <span className="text-font/60 text-xs ml-2">{v.desc}</span>
                            </VoiceSelectorItem>
                          ))}
                        </VoiceSelectorGroup>
                      </VoiceSelectorList>
                    </VoiceSelectorContent>
                  </VoiceSelector>
                  )}
                  <SpeechInput
                    variant="ghost"
                    size="icon-sm"
                    onTranscriptionChange={(text) => {
                      emitClick('ui:chat:voice', { text })
                      submit(text)
                    }}
                  />
                  <PromptInputSubmit status={status} onStop={stop} />
                </PromptInputTools>
              </PromptInput>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </>
  )
}
