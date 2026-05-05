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
import {
  Attachment,
  Attachments,
  AttachmentPreview,
  AttachmentRemove,
} from '@/components/ai-elements/attachments'
import type { FileUIPart } from 'ai'
import { ShowcaseModelPicker } from './showcase/ShowcaseModelPicker'

const ShowcaseMessageList = lazy(() =>
  import('@/components/showcase/ShowcaseMessageList').then((m) => ({
    default: m.ShowcaseMessageList,
  })),
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
    label: 'Plan',
    starters: [
      'Plan a launch checklist for a new SaaS landing page',
      'Outline a 5-step migration from REST to a streaming agent API',
    ],
  },
  {
    label: 'Reasoning',
    starters: [
      'Explain step by step why pheromone routing converges to highways',
      'Reason out loud: which is better, BFS or DFS for a small DAG?',
    ],
  },
  {
    label: 'Tool — CF scrape',
    starters: [
      'Crawl https://example.com and summarise it',
      'Extract the headings from https://news.ycombinator.com',
    ],
  },
  {
    label: 'Chain of thought',
    starters: [
      'Plan and then crawl https://example.com — show the chain of thought',
    ],
  },
]

const DEFAULT_MODEL = 'deepseek/deepseek-r1'

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

export function Showcase({ group = 'default' }: Props) {
  const [model, setModel] = useState<string>(DEFAULT_MODEL)

  const { messages, sendMessage, addToolApprovalResponse, regenerate, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/showcase-chat',
      body: () => ({ group, model }),
    }),
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = window.localStorage.getItem('showcase:model')
    if (saved) setModel(saved)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') window.localStorage.setItem('showcase:model', model)
  }, [model])

  // Suggestion-button progressive enhancement (?q=...)
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

  const submit = (text: string, files?: FileUIPart[]) => {
    if (status === 'submitted' || status === 'streaming') return
    const trimmed = text.trim()
    if (!trimmed && (!files || files.length === 0)) return
    emitClick('ui:showcase:send', { model })
    sendMessage({ text: trimmed, files })
  }

  const retry = () => {
    if (status === 'submitted' || status === 'streaming') return
    regenerate()
  }

  const lastMsg = messages[messages.length - 1]
  const lastIsAssistantStreaming =
    lastMsg?.role === 'assistant' &&
    lastMsg.parts.some((p) => p.type === 'text' || p.type === 'reasoning')
  const showThinking = status === 'submitted' && !lastIsAssistantStreaming

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
                    fetchPriority="high"
                    className="rounded-2xl"
                  />
                  <div className="text-center">
                    <p className="text-lg mb-1">AI Elements showcase</p>
                    <p className="text-sm text-font/60">
                      Plan · Reasoning · Tool · Chain of thought · Actions · Model picker
                    </p>
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
                      emitClick('ui:showcase:suggestion', { text })
                      submit(text)
                    }}
                  >
                    {STARTER_CATEGORIES.map((cat) => (
                      <div key={cat.label} className="w-full">
                        <p className="text-xs text-font/60 uppercase tracking-wide mb-2 text-left">
                          {cat.label}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {cat.starters.map((s) => (
                            <button
                              key={s}
                              type="submit"
                              name="q"
                              value={s}
                              className="border h-auto px-5 py-3 text-base rounded-2xl hover:bg-foreground transition cursor-pointer text-left"
                              style={{ borderColor: 'var(--color-border)' }}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </form>
                </div>
              )}

              {messages.length > 0 && (
                <Suspense fallback={null}>
                  <ShowcaseMessageList
                    messages={messages}
                    status={status}
                    onApproval={addToolApprovalResponse}
                    onRetry={retry}
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
                <PromptInputBody>
                  <PromptInputTextarea
                    placeholder="Ask anything — try a URL or a planning task…"
                    rows={5}
                    style={{ minHeight: '120px', paddingTop: '20px' }}
                    className="text-lg focus-visible:ring-0 focus-visible:border-0 focus-visible:outline-none border-0"
                  />
                </PromptInputBody>
                <PromptInputTools>
                  <ShowcaseModelPicker value={model} onChange={setModel} />
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
