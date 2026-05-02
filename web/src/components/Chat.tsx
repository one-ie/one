import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Mic, X } from 'lucide-react'
import { Icon } from '@/components/ui/Icon'
import { TooltipProvider } from '@/components/ui/tooltip'
import { emitClick } from '@/lib/ui-signal'
import { Conversation, ConversationContent } from '@/components/ai-elements/conversation'
import { Message } from '@/components/ai-elements/message'
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input'
import { Tool, ToolHeader } from '@/components/ai-elements/tool'
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning'
import type { DynamicToolUIPart, ToolUIPart } from 'ai'

interface Props {
  fullPage?: boolean
  onClose?: () => void
  group?: string
}

export function Chat({ fullPage = false, onClose, group = 'default' }: Props) {
  const { messages, sendMessage, addToolApprovalResponse, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat', body: { group } }),
  })

  const containerClass = fullPage
    ? 'flex flex-col h-full max-w-3xl mx-auto text-base'
    : 'flex flex-col h-[500px] w-[380px] text-base'

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
            <div className="text-center text-font/50 py-8">
              <p className="text-lg mb-2">Hello!</p>
              <p className="text-sm">Ask me anything about ONE.</p>
            </div>
          )}
          {messages.map((msg) => (
            <Message key={msg.id} from={msg.role}>
              {msg.parts.map((part, i) => {
                if (part.type === 'text') {
                  return msg.role === 'user'
                    ? <div key={i} className="ml-auto max-w-[80%] px-4 py-2 rounded-2xl bg-foreground text-font">{part.text}</div>
                    : <div key={i} className="max-w-[80%] text-font">{part.text}</div>
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
                  const approvalId = (toolPart as { approval?: { id: string } }).approval?.id ?? ''
                  const toolName = 'toolName' in toolPart ? toolPart.toolName : toolPart.type
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
            </Message>
          ))}
        </ConversationContent>
      </Conversation>

      <div className="px-4 pb-4 pt-3">
        <div className="chat-prompt rounded-xl bg-background overflow-hidden">
          <PromptInput
            className="[&>div]:h-auto [&>div]:items-end [&>div]:border-0 [&>div]:shadow-none [&>div]:outline-none"
            onSubmit={({ text }) => {
              if (!text.trim() || status === 'submitted' || status === 'streaming') return
              emitClick('ui:chat:send')
              sendMessage({ text: text.trim() })
            }}
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
              <PromptInputButton
                size="icon-sm"
                tooltip="Voice input"
                onClick={() => emitClick('ui:chat:voice')}
              >
                <Mic className="size-4" />
              </PromptInputButton>
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
