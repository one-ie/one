import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Volume2, X, Wrench, AlertCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
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
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from '@/components/ai-elements/prompt-input'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Image as ImageIcon, FileText, Camera, Monitor } from 'lucide-react'
import { Tool, ToolHeader } from '@/components/ai-elements/tool'
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion'
import { Shimmer } from '@/components/ai-elements/shimmer'
import { Message } from '@/components/ai-elements/message'
import { MarkdownView } from '@/components/ai-elements/markdown'
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning'
import {
  Attachment,
  Attachments,
  AttachmentInfo,
  AttachmentPreview,
  AttachmentRemove,
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

function FileInput({
  inputRef,
  accept,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>
  accept?: string
}) {
  const attachments = usePromptInputAttachments()
  return (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      multiple
      className="sr-only"
      onChange={(e) => {
        const files = Array.from(e.currentTarget.files ?? [])
        if (files.length) attachments.add(files)
        e.currentTarget.value = ''
      }}
    />
  )
}

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

function CameraDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const attachments = usePromptInputAttachments()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    let cancelled = false
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((stream) => {
        if (cancelled) {
          for (const t of stream.getTracks()) t.stop()
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
      })
      .catch((e: Error) => {
        setError(e.message || 'Camera unavailable')
      })
    return () => {
      cancelled = true
      const s = streamRef.current
      if (s) for (const t of s.getTracks()) t.stop()
      streamRef.current = null
    }
  }, [open])

  if (!open) return null

  const capture = () => {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      if (!blob) return
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
      attachments.add([file])
      onClose()
    }, 'image/jpeg', 0.92)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-background rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
        {error ? (
          <div className="p-8 text-center text-font">
            <p className="mb-4">Camera unavailable: {error}</p>
            <Button type="button" variant="outline" onClick={onClose}>Close</Button>
          </div>
        ) : (
          <>
            <video ref={videoRef} className="w-full h-auto bg-black" playsInline muted />
            <div className="flex justify-between items-center gap-3 p-4">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="button" onClick={capture} className="bg-primary text-on-primary">
                <Camera className="size-4 mr-2" />
                Capture
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function AddMenu() {
  const attachments = usePromptInputAttachments()
  const [open, setOpen] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const picturesRef = useRef<HTMLInputElement | null>(null)
  const filesRef = useRef<HTMLInputElement | null>(null)

  const captureScreenshot = async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      console.error('Screen capture unsupported')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      })
      const track = stream.getVideoTracks()[0]
      const video = document.createElement('video')
      video.srcObject = stream
      video.muted = true
      await video.play()
      await new Promise((r) => setTimeout(r, 120))
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.drawImage(video, 0, 0)
      track.stop()
      canvas.toBlob((blob) => {
        if (!blob) return
        const file = new File([blob], `screenshot-${Date.now()}.png`, { type: 'image/png' })
        attachments.add([file])
      }, 'image/png')
    } catch (e) {
      console.error('screenshot error', e)
    }
  }
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }
  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setOpen(false), 400)
  }
  return (
    <>
      <FileInput inputRef={picturesRef} accept="image/*" />
      <FileInput inputRef={filesRef} />
      <PromptInputActionMenu open={open} onOpenChange={setOpen} modal={false}>
        <div
          className="inline-flex self-end pb-2 pl-2"
          onMouseEnter={() => { cancelClose(); setOpen(true) }}
          onMouseLeave={scheduleClose}
        >
          <PromptInputActionMenuTrigger
            className="!size-9 !rounded-full [&>svg]:!size-4 !bg-foreground hover:!bg-primary hover:!text-on-primary data-[state=open]:!bg-primary data-[state=open]:!text-on-primary"
          />
        </div>
        <PromptInputActionMenuContent
          sideOffset={4}
          className="bg-foreground"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <DropdownMenuItem
            className="focus:!bg-primary focus:!text-on-primary"
            onSelect={(e) => {
              e.preventDefault()
              setOpen(false)
              picturesRef.current?.click()
            }}
          >
            <ImageIcon className="mr-2 size-4 shrink-0" />
            Pictures
          </DropdownMenuItem>
          <DropdownMenuItem
            className="focus:!bg-primary focus:!text-on-primary"
            onSelect={(e) => {
              e.preventDefault()
              setOpen(false)
              filesRef.current?.click()
            }}
          >
            <FileText className="mr-2 size-4 shrink-0" />
            Files
          </DropdownMenuItem>
          <DropdownMenuItem
            className="focus:!bg-primary focus:!text-on-primary"
            onSelect={(e) => {
              e.preventDefault()
              setOpen(false)
              setCameraOpen(true)
            }}
          >
            <Camera className="mr-2 size-4 shrink-0" />
            Camera
          </DropdownMenuItem>
          <DropdownMenuItem
            className="focus:!bg-primary focus:!text-on-primary"
            onSelect={(e) => {
              e.preventDefault()
              setOpen(false)
              void captureScreenshot()
            }}
          >
            <Monitor className="mr-2 size-4 shrink-0" />
            Screenshot
          </DropdownMenuItem>
        </PromptInputActionMenuContent>
      </PromptInputActionMenu>
      <CameraDialog open={cameraOpen} onClose={() => setCameraOpen(false)} />
    </>
  )
}

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
    if (status === 'submitted' || status === 'streaming') return
    const trimmed = text.trim()
    if (!trimmed && (!files || files.length === 0)) return
    emitClick('ui:chat:send')
    sendMessage({ text: trimmed, files })
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
                  <div className="flex flex-wrap justify-center items-center gap-2 px-6 py-2 max-w-2xl mx-auto">
                    {STARTERS.map((s) => (
                      <Suggestion
                        key={s}
                        suggestion={s}
                        className="border h-auto px-5 py-3 text-base"
                        style={{ borderColor: 'var(--color-border)' }}
                        onClick={(text) => {
                          emitClick('ui:chat:suggestion', { text })
                          submit(text)
                        }}
                      />
                    ))}
                  </div>
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
                    <div
                      className={`flex flex-col gap-2 max-w-[80%] ${msg.role === 'assistant' ? 'mr-auto' : 'ml-auto'}`}
                    >
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
                              className="ml-auto px-5 py-3 rounded-2xl bg-background text-font"
                            >
                              {part.text}
                            </div>
                          ) : (
                            <MarkdownView
                              key={i}
                              className="text-font break-words space-y-2"
                            >
                              {part.text}
                            </MarkdownView>
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
                multiple
                globalDrop
                className="[&>div]:h-auto [&>div]:items-end [&>div]:border-0 [&>div]:shadow-none [&>div]:outline-none"
                onSubmit={({ text, files }) => submit(text, files)}
              >
                <AttachmentsPreview />
                <AddMenu />
                <PromptInputBody>
                  <PromptInputTextarea
                    placeholder="Type a message…"
                    rows={5}
                    style={{ minHeight: '120px', paddingTop: '20px' }}
                    className="text-lg focus-visible:ring-0 focus-visible:border-0 focus-visible:outline-none border-0"
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
                        className="h-10 px-3 text-sm gap-1.5"
                        onClick={() => emitClick('ui:chat:voice-open')}
                      >
                        <Volume2 className="size-4" />
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
