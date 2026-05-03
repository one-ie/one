import { lazy, Suspense } from 'react'
import { Volume2, Wrench, AlertCircle } from 'lucide-react'
import type { DynamicToolUIPart, FileUIPart, ToolUIPart, UIMessage } from 'ai'
import { Message } from '@/components/ai-elements/message'
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning'
import { Tool, ToolHeader } from '@/components/ai-elements/tool'
import {
  Attachment,
  Attachments,
  AttachmentInfo,
  AttachmentPreview,
} from '@/components/ai-elements/attachments'
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
import { Button } from '@/components/ui/button'
import { emitClick } from '@/lib/ui-signal'

const MarkdownView = lazy(() =>
  import('@/components/ai-elements/markdown').then((m) => ({ default: m.MarkdownView })),
)

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

interface Props {
  messages: UIMessage[]
  status: 'submitted' | 'streaming' | 'ready' | 'error'
  speakFor: { id: string; url: string } | null
  ttsAvailable: boolean
  onSpeak: (msg: UIMessage) => void
  onApproval: (args: { id: string; approved: boolean }) => void
}

export function MessageList({
  messages,
  status,
  speakFor,
  ttsAvailable,
  onSpeak,
  onApproval,
}: Props) {
  return (
    <>
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
                      const stepStatus = toolStepStatus(state)
                      const errored = state === 'output-error'
                      return (
                        <ChainOfThoughtStep
                          key={`${msg.id}-cot-${i}`}
                          icon={errored ? AlertCircle : Wrench}
                          label={toolStepLabel(p)}
                          status={stepStatus}
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
                    <Suspense
                      key={i}
                      fallback={
                        <div className="text-font break-words whitespace-pre-wrap">
                          {part.text}
                        </div>
                      }
                    >
                      <MarkdownView className="text-font break-words space-y-2">
                        {part.text}
                      </MarkdownView>
                    </Suspense>
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
                            onApproval({ id: approvalId, approved: true })
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
                            onApproval({ id: approvalId, approved: false })
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
                    onClick={() => onSpeak(msg)}
                  >
                    <Volume2 className="size-3.5 mr-1.5" />
                    {speakingHere ? 'Stop' : 'Speak'}
                  </Button>
                </div>
              )}
              {speakingHere && (
                <AudioPlayer
                  className="mt-1 rounded-lg overflow-hidden border"
                  style={{ borderColor: 'var(--color-border)' }}
                >
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
    </>
  )
}
