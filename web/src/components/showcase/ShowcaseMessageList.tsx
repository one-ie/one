import { lazy, Suspense } from 'react'
import { AlertCircle, Wrench } from 'lucide-react'
import type { DynamicToolUIPart, FileUIPart, ToolUIPart, UIMessage } from 'ai'
import { Message } from '@/components/ai-elements/message'
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning'
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from '@/components/ai-elements/tool'
import {
  Plan,
  PlanContent,
  PlanDescription,
  PlanHeader,
  PlanTitle,
  PlanTrigger,
} from '@/components/ai-elements/plan'
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
import { emitClick } from '@/lib/ui-signal'
import { MessageActions } from './MessageActions'

const MarkdownView = lazy(() =>
  import('@/components/ai-elements/markdown').then((m) => ({ default: m.MarkdownView })),
)

interface PlanOutput {
  title: string
  description: string
  steps: { title: string; detail?: string }[]
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
  if (state === 'output-available') return name
  return `${name}…`
}

function toolName(p: ToolUIPart | DynamicToolUIPart): string {
  return 'toolName' in p ? p.toolName : p.type.replace(/^tool-/, '')
}

function isPlanOutput(value: unknown): value is PlanOutput {
  if (!value || typeof value !== 'object') return false
  const v = value as { title?: unknown; description?: unknown; steps?: unknown }
  return (
    typeof v.title === 'string' &&
    typeof v.description === 'string' &&
    Array.isArray(v.steps)
  )
}

function getMessageText(msg: UIMessage): string {
  return msg.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('\n\n')
    .trim()
}

interface Props {
  messages: UIMessage[]
  status: 'submitted' | 'streaming' | 'ready' | 'error'
  onApproval: (args: { id: string; approved: boolean }) => void
  onRetry: () => void
}

export function ShowcaseMessageList({ messages, status, onApproval, onRetry }: Props) {
  const lastAssistantId = [...messages].reverse().find((m) => m.role === 'assistant')?.id

  return (
    <>
      {messages.map((msg) => {
        const fileParts = msg.parts.filter((p) => p.type === 'file') as FileUIPart[]
        const toolParts = msg.parts.filter(isToolPart)
        const nonPlanToolParts = toolParts.filter((p) => toolName(p) !== 'plan')
        const anyActive = nonPlanToolParts.some(
          (p) => toolStepStatus((p as { state?: string }).state) === 'active',
        )
        const hasText = msg.parts.some((p) => p.type === 'text')
        const isAssistant = msg.role === 'assistant'
        const showActions =
          isAssistant && hasText && msg.id === lastAssistantId && status !== 'streaming'
        return (
          <Message key={msg.id} from={msg.role}>
            <div
              className={`flex flex-col gap-2 max-w-[80%] ${isAssistant ? 'mr-auto' : 'ml-auto'}`}
            >
              {fileParts.length > 0 && (
                <Attachments variant={msg.role === 'user' ? 'grid' : 'list'}>
                  {fileParts.map((f, i) => (
                    <Attachment key={`${msg.id}-f-${i}`} data={{ ...f, id: `${msg.id}-f-${i}` }}>
                      <AttachmentPreview />
                      <AttachmentInfo />
                    </Attachment>
                  ))}
                </Attachments>
              )}

              {isAssistant && nonPlanToolParts.length > 0 && (
                <ChainOfThought defaultOpen={anyActive}>
                  <ChainOfThoughtHeader>
                    {anyActive
                      ? `Working — ${nonPlanToolParts.length} step${nonPlanToolParts.length === 1 ? '' : 's'}`
                      : `Used ${nonPlanToolParts.length} tool${nonPlanToolParts.length === 1 ? '' : 's'}`}
                  </ChainOfThoughtHeader>
                  <ChainOfThoughtContent>
                    {nonPlanToolParts.map((p, i) => {
                      const state = (p as { state?: string }).state
                      const errored = state === 'output-error'
                      return (
                        <ChainOfThoughtStep
                          key={`${msg.id}-cot-${i}`}
                          icon={errored ? AlertCircle : Wrench}
                          label={toolStepLabel(p)}
                          status={toolStepStatus(state)}
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

                if (isToolPart(part)) {
                  const name = toolName(part)
                  const state = (part as { state?: string }).state

                  // Plan tool gets its own card.
                  if (name === 'plan' && state === 'output-available') {
                    const out = (part as { output?: unknown }).output
                    if (isPlanOutput(out)) {
                      return (
                        <Plan key={i} defaultOpen className="bg-background">
                          <PlanHeader>
                            <div className="flex-1">
                              <PlanTitle>{out.title}</PlanTitle>
                              <PlanDescription>{out.description}</PlanDescription>
                            </div>
                            <PlanTrigger />
                          </PlanHeader>
                          <PlanContent>
                            <ol className="space-y-2">
                              {out.steps.map((s, idx) => (
                                <li key={idx} className="flex gap-3">
                                  <span className="flex-none size-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                                    {idx + 1}
                                  </span>
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">{s.title}</div>
                                    {s.detail && (
                                      <div className="text-xs text-font/60 mt-0.5">{s.detail}</div>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ol>
                          </PlanContent>
                        </Plan>
                      )
                    }
                  }

                  // Approval gate
                  if (state === 'approval-requested') {
                    const approvalId =
                      (part as { approval?: { id: string } }).approval?.id ?? ''
                    return (
                      <Tool key={i}>
                        <ToolHeader
                          type={part.type as DynamicToolUIPart['type']}
                          state={state as DynamicToolUIPart['state']}
                          toolName={name}
                        />
                        <div className="flex gap-2 p-3">
                          <button
                            type="button"
                            className="bg-primary text-on-primary rounded-lg px-3 py-1.5 text-xs"
                            onClick={() => {
                              emitClick('ui:showcase:tool-approve')
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
                              emitClick('ui:showcase:tool-deny')
                              onApproval({ id: approvalId, approved: false })
                            }}
                          >
                            Deny
                          </button>
                        </div>
                      </Tool>
                    )
                  }

                  // Tool detail (input + output)
                  if (state === 'output-available' || state === 'output-error') {
                    const input = (part as { input?: unknown }).input
                    const output = (part as { output?: unknown }).output
                    const errorText = (part as { errorText?: string }).errorText
                    return (
                      <Tool key={i}>
                        <ToolHeader
                          type={part.type as DynamicToolUIPart['type']}
                          state={state as DynamicToolUIPart['state']}
                          toolName={name}
                        />
                        <ToolContent>
                          {input !== undefined && (
                            <ToolInput input={input as Record<string, unknown>} />
                          )}
                          <ToolOutput output={output as never} errorText={errorText as never} />
                        </ToolContent>
                      </Tool>
                    )
                  }
                  return null
                }
                return null
              })}

              {showActions && (
                <MessageActions
                  text={getMessageText(msg)}
                  onRetry={onRetry}
                  canRetry={status === 'ready'}
                />
              )}
            </div>
          </Message>
        )
      })}
    </>
  )
}
