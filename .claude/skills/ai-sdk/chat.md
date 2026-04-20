# AI SDK Chat Integration

Streaming chat with useChat hook and tool calling for world commands.

## useChat Hook

```typescript
'use client'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'

export function WorldChat({ onCommand }) {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    onFinish: ({ message }) => {
      const cmd = parseWorldCommand(message)
      if (cmd) onCommand(cmd)
    }
  })

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>
          {msg.parts.map((part, i) =>
            part.type === 'text' ? <span key={i}>{part.text}</span> :
            part.type === 'tool-invocation' ? <ToolCard key={i} tool={part} /> :
            null
          )}
        </div>
      ))}
      <ChatInput 
        onSend={text => sendMessage({ text })} 
        disabled={status === 'streaming'} 
      />
    </div>
  )
}
```

## API Route (Astro)

```typescript
// src/pages/api/chat.ts
import { streamText, tool } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

export async function POST({ request }) {
  const { messages } = await request.json()

  const result = streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: `You control a world of agents. Commands:
      spawn(id, kind) - create agent
      connect(from, to) - create flow
      send(to, data) - send signal`,
    messages,
    tools: {
      spawn: tool({
        description: 'Create a new agent',
        inputSchema: z.object({
          id: z.string(),
          kind: z.enum(['scout', 'analyst', 'trader', 'relay', 'queen']),
        }),
        execute: async ({ id, kind }) => ({ spawned: id, kind })
      }),
      connect: tool({
        description: 'Connect two agents',
        inputSchema: z.object({
          from: z.string(),
          to: z.string(),
        }),
        execute: async ({ from, to }) => ({ connected: `${from}→${to}` })
      }),
      send: tool({
        description: 'Send signal to agent',
        inputSchema: z.object({
          to: z.string(),
          data: z.record(z.unknown()).optional(),
        }),
        execute: async ({ to, data }) => ({ sent: to, data })
      }),
    }
  })

  return result.toUIMessageStreamResponse()
}
```

## Status States

| Status | UI Action |
|--------|-----------|
| `submitted` | Show spinner |
| `streaming` | Disable input |
| `ready` | Enable input |
| `error` | Show retry |

## Tool Visualization

```typescript
function ToolCard({ tool }) {
  const { skin } = useMetaphor()
  
  if (tool.state === 'pending') {
    return <div className="animate-pulse">Running {tool.name}...</div>
  }
  
  return (
    <div style={{ 
      backgroundColor: skin.colors.surface,
      borderColor: skin.colors.success 
    }}>
      {skin.icons.actor} {tool.name}: {JSON.stringify(tool.result)}
    </div>
  )
}
```

## Voice Input

```typescript
function VoiceInput({ onTranscript }) {
  const [listening, setListening] = useState(false)
  const recognition = useRef<SpeechRecognition>()

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognition.current = new webkitSpeechRecognition()
      recognition.current.continuous = true
      recognition.current.onresult = (e) => {
        const text = e.results[e.results.length - 1][0].transcript
        onTranscript(text)
      }
    }
  }, [])

  return (
    <button onClick={() => {
      listening ? recognition.current?.stop() : recognition.current?.start()
      setListening(!listening)
    }}>
      {listening ? '🔴' : '🎤'}
    </button>
  )
}
```

## World Commands

```typescript
type WorldCommand =
  | { type: 'spawn'; id: string; kind: string }
  | { type: 'connect'; from: string; to: string }
  | { type: 'send'; to: string; data?: unknown }

function parseWorldCommand(message): WorldCommand | null {
  for (const part of message.parts) {
    if (part.type === 'tool-invocation' && part.state === 'result') {
      const { name, result } = part
      if (name === 'spawn') return { type: 'spawn', ...result }
      if (name === 'connect') return { type: 'connect', ...result }
      if (name === 'send') return { type: 'send', ...result }
    }
  }
  return null
}
```

## Dependencies

```bash
bun install ai @ai-sdk/react @ai-sdk/anthropic zod
```

---

*Streaming. Tools. Voice. World commands.*
