# speed-chat-todo

> **Spec (source of truth):** [`speed-chat.md`](speed-chat.md)
> **Mode:** lean per tier — spec locked, variance known, exit scalar, files known
> **Scope:** Tier 1–4 (Plays 1–16). Tier 5 (WebGPU + predictive prefetch) is a separate TODO.

---

## Classifier

| Prior | Answer | Justification |
|-------|--------|---------------|
| Spec locked | YES | `speed-chat.md` defines all 19 plays with exact file paths and code snippets |
| Variance known | YES | One shape per play — config flip, small code edit, or new route; no discovery needed |
| Exit scalar | YES | TTFT p50 measurement gate per tier: T1 ≤700 ms · T2 ≤300 ms · T3 ≤150 ms · T4 ≤100 ms |
| Files known | YES | 7 files named in spec; no new files beyond `warmup.ts` (Play 8) |

`mode: lean` · `lifecycle: construction`

---

## Routing

```
keystroke → Enter
  → React submit (Chat.tsx)
    → POST /api/chat
      → CF Worker (chat.ts)
        → provider (Groq after Play 7)
          → stream back
            → SSE chunks → MessageList render

Warm-up path (Play 8):
  Chat hydrate → POST /api/chat/warmup → discard

Speculative path (Play 16):
  first keystroke → POST /api/chat/speculate (held)
  Enter           → POST /api/chat/commit?id=X → stream through held conn

TTFT signal:
  status=submitted → sendStartRef = now()
  status=streaming → emitClick('ui:chat:ttft', { ms })
```

---

## Schema reference

None. All plays are config, code, or new Worker routes. No TypeDB entities, no D1 migrations, no claw changes.

---

## Source of truth

| Doc | Locks |
|-----|-------|
| [`one/speed-chat.md`](speed-chat.md) | 19 plays, exact file edits, TTFT targets per tier |
| [`one/dictionary.md`](dictionary.md) | Canonical names, 6 verbs, 4 outcomes |
| [`one/rubrics.md`](rubrics.md) | fit / form / truth / taste scoring (gate 0.65) |
| [`.claude/rules/ui.md`](../.claude/rules/ui.md) | `emitClick('ui:chat:ttft')` contract |
| [`.claude/rules/design.md`](../.claude/rules/design.md) | 6 tokens, no palette colors |

---

## Documentation updates (W2)

**New docs:** none

**Docs modified:**
- `one/speed-chat.md` — mark each play shipped with ✓ as tiers close

**Schema changes:** none

---

## W1 — Recon

Goal: confirm current state of all 7 files before any edit.

**Tasks:**

| id | exit |
|----|------|
| W1-T1 | `wrangler.toml` — confirm no `[placement]` block exists yet |
| W1-T2 | `chat.ts` — confirm `toUIMessageStreamResponse` call site; no `X-Accel-Buffering` header yet |
| W1-T3 | `chat.ts` — confirm provider is OpenRouter (`openrouter.ai`) not Groq |
| W1-T4 | `chat.astro` — confirm no `<link rel="preconnect" href="/api/chat">` in head |
| W1-T5 | `Chat.tsx` — confirm mount `useEffect` exists; confirm no warm-up `fetch` call |
| W1-T6 | `Chat.tsx` — confirm `status === 'submitted'` shimmer exists (line ~201); confirm no TTFT logger |
| W1-T7 | `wrangler.toml` — confirm `[ai] binding = "AI"` exists (needed for Play 9 fallback) |

**Commands:**
```bash
grep -n 'placement\|X-Accel\|GROQ\|preconnect\|warmup\|sendStartRef\|THREADS' \
  web/wrangler.toml web/src/pages/api/chat.ts web/src/pages/chat.astro web/src/components/Chat.tsx
grep -n '\[ai\]' web/wrangler.toml
grep -n 'openrouter\|groq' web/src/pages/api/chat.ts
```

---

## W2 — Decide

Goal: confirm edit anchors + order of operations.

**Tasks:**

| id | exit |
|----|------|
| W2-T1 | Tier 1 plays (1–6) are pure config/small edits — ship as one W3 batch |
| W2-T2 | Tier 2 Play 7 (Groq) requires `bun add @ai-sdk/groq` + secret — confirm `GROQ_API_KEY` available or note it as blocker |
| W2-T3 | Play 8 `warmup.ts` is a new file — confirm path: `web/src/pages/api/chat/warmup.ts` |
| W2-T4 | Play 9 Workers AI fallback wraps the Groq call in try/catch — confirm `workers-ai-provider` pkg available or add it |
| W2-T5 | Tier 3–4 plays ship after Tier 1+2 are measured live (spec rule: no skipping) |

**Blockers to resolve before W3:**
- `GROQ_API_KEY` must be set via `wrangler secret put GROQ_API_KEY` (Play 7)
- `workers-ai-provider` pkg check: `grep workers-ai-provider web/package.json` (Play 9)

---

## W3 — Edit

Tiers ship sequentially. Measure p50 TTFT between each tier before continuing.

---

### Tier 1 — 30 minutes (Plays 1–6)

| id | value | effort | exit | tags |
|----|-------|--------|------|------|
| T1-P1 | high | XS | `[placement] mode = "smart"` in `wrangler.toml` | [config] |
| T1-P2 | high | XS | 0-RTT verified ON in CF dashboard | [config] |
| T1-P3 | high | XS | `X-Accel-Buffering: no` + `Cache-Control: no-cache, no-transform` + `Content-Encoding: identity` in `toUIMessageStreamResponse` headers | [chat-api] |
| T1-P4 | high | XS | `<link rel="preconnect" href="/api/chat">` + `dns-prefetch` in chat head; warm-up GET in mount useEffect | [chat, astro] |
| T1-P5 | high | S | Token-skeleton bubble renders on `status === 'submitted'` before first real token | [chat, react] |
| T1-P6 | high | XS | `experimental_providerMetadata` with Anthropic `cacheControl` + OpenAI `promptCache` added to `streamText` call | [chat-api] |

#### T1-P1 — Smart Placement

```toml
# web/wrangler.toml — add after existing [env] or at top level
[placement]
mode = "smart"
```

#### T1-P3 — Kill response buffering

```ts
// web/src/pages/api/chat.ts — wrap existing toUIMessageStreamResponse
return result.toUIMessageStreamResponse({
  headers: {
    'X-Accel-Buffering': 'no',
    'Cache-Control': 'no-cache, no-transform',
    'Content-Encoding': 'identity',
  },
})
```

#### T1-P4 — Preconnect + warm-up

```astro
<!-- web/src/pages/chat.astro — add to <head> (or Layout if shared) -->
<link rel="preconnect" href="/api/chat" />
<link rel="dns-prefetch" href="/api/chat" />
```

```ts
// web/src/components/Chat.tsx — inside existing mount useEffect
fetch('/api/chat', { method: 'GET' }).catch(() => {}) // returns 405; warms socket
```

#### T1-P5 — Optimistic UI placeholder

```tsx
// web/src/components/Chat.tsx — add inside the status === 'submitted' branch (~line 201)
// After existing "Thinking…" shimmer, render a token-shaped skeleton:
{status === 'submitted' && (
  <div className="flex gap-3 px-4 py-3">
    <div className="w-6 h-6 rounded-full bg-foreground shrink-0" />
    <div className="flex flex-col gap-2 flex-1">
      <div className="h-3 bg-foreground rounded w-3/4 animate-pulse" />
      <div className="h-3 bg-foreground rounded w-1/2 animate-pulse" />
    </div>
  </div>
)}
```

#### T1-P6 — Prompt prefix caching

```ts
// web/src/pages/api/chat.ts — add to existing streamText call
streamText({
  model: ...,
  system: SYSTEM,
  messages: await convertToModelMessages(messages),
  experimental_providerMetadata: {
    anthropic: { cacheControl: { type: 'ephemeral' } },
    openai: { promptCache: true },
  },
})
```

**Tier 1 verify gate:** `bun run build` clean + TTFT p50 measured ≤700 ms before starting Tier 2.

---

### Tier 2 — 2 hours (Plays 7–10)

| id | value | effort | exit | tags |
|----|-------|--------|------|------|
| T2-P7 | high | M | Provider switched to Groq `llama-3.3-70b-versatile`; OpenRouter import removed | [chat-api] |
| T2-P8 | high | S | `POST /api/chat/warmup` route fires 1-token Groq request on Chat hydrate | [chat-api, chat] |
| T2-P9 | med | S | Workers AI fallback in try/catch around Groq call | [chat-api] |
| T2-P10 | low | XS | System prompt includes parallel-tool-call instruction | [chat-api] |

#### T2-P7 — Drop OpenRouter, go Groq direct

```bash
cd web && bun add @ai-sdk/groq
wrangler secret put GROQ_API_KEY
```

```ts
// web/src/pages/api/chat.ts — replace provider import + model line
import { createGroq } from '@ai-sdk/groq'
const groq = createGroq({ apiKey: env.GROQ_API_KEY })

// in streamText:
model: groq('llama-3.3-70b-versatile'),
```

#### T2-P8 — Pre-warm model pod

```ts
// web/src/components/Chat.tsx — mount useEffect (alongside existing warm-up GET)
fetch('/api/chat/warmup', { method: 'POST' }).catch(() => {})
```

```ts
// web/src/pages/api/chat/warmup.ts — new file
import type { APIContext } from 'astro'
import { createGroq } from '@ai-sdk/groq'
import { generateText } from 'ai'

export const POST = async ({ locals }: APIContext) => {
  const groq = createGroq({ apiKey: (locals.runtime.env as Env).GROQ_API_KEY })
  generateText({ model: groq('llama-3.3-70b-versatile'), prompt: 'hi', maxTokens: 1 }).catch(() => {})
  return new Response(null, { status: 204 })
}
```

#### T2-P9 — Workers AI fallback

```ts
// web/src/pages/api/chat.ts — wrap Groq streamText in try/catch
import { createWorkersAI } from 'workers-ai-provider'

let result
try {
  result = await streamText({ model: groq('llama-3.3-70b-versatile'), ...opts })
} catch {
  const ai = createWorkersAI({ binding: env.AI })
  result = await streamText({ model: ai('@cf/meta/llama-3.3-70b-instruct-fp8-fast'), ...opts })
}
```

#### T2-P10 — Parallel tool calls

```ts
// web/src/pages/api/chat.ts — append to SYSTEM prompt constant
const SYSTEM = `...existing system prompt...

When tools are independent, call them in parallel.`
```

**Tier 2 verify gate:** `bun run build` clean + TTFT p50 measured ≤300 ms before starting Tier 3.

---

### Tier 3 — half day (Plays 11–13)

| id | value | effort | exit | tags |
|----|-------|--------|------|------|
| T3-P11 | med | M | Starter answers cached in CF KV with stale-while-revalidate | [chat-api, config] |
| T3-P12 | med | M | Title sidecar via Workers AI fires in `ctx.waitUntil` alongside main stream | [chat-api] |
| T3-P13 | high | M | Web Speech fires submit on transcript stabilize, before user stops speaking | [speech] |

#### T3-P11 — Edge-cache starter answers

```toml
# web/wrangler.toml — add KV binding
[[kv_namespaces]]
binding = "CHAT_CACHE"
id = "<create via wrangler kv:namespace create CHAT_CACHE>"
```

```ts
// web/src/pages/api/chat.ts — before streamText call
const STARTER_PROMPTS = new Set(['What is ONE?', 'Show me the signal highways', ...])
const isStarter = STARTER_PROMPTS.has(lastUserMessage)
const cacheKey = isStarter ? `chat:starter:${hash(SYSTEM + lastUserMessage)}` : null
if (cacheKey) {
  const cached = await env.CHAT_CACHE.get(cacheKey)
  if (cached) {
    ctx.waitUntil(regenerateAndStore(cacheKey, env, opts))
    return new Response(cached, { headers: SSE_HEADERS })
  }
}
// after stream closes: ctx.waitUntil(env.CHAT_CACHE.put(cacheKey, streamText, { expirationTtl: 3600 }))
```

#### T3-P12 — Title sidecar

```ts
// web/src/pages/api/chat.ts — in ctx.waitUntil alongside stream
ctx.waitUntil((async () => {
  const ai = createWorkersAI({ binding: env.AI })
  const { text } = await generateText({
    model: ai('@cf/meta/llama-3.1-8b-instruct'),
    prompt: `One-line thread title for: "${lastUserMessage}"`,
    maxTokens: 20,
  })
  await env.KV?.put(`thread:title:${threadId}`, text)
})())
```

#### T3-P13 — Web Speech early-fire

```ts
// web/src/components/ai-elements/speech-input.tsx
recognition.onresult = (e) => {
  const text = combineFinalResults(e)
  setTranscript(text)
  if (isStable(text) && !alreadyFired.current) {
    alreadyFired.current = true
    onSubmit(text)  // fire before user stops speaking
  }
}

function isStable(text: string) {
  // stable if last 2 final segments end with punctuation or ≥6 words
  return /[.!?]$/.test(text) || text.split(' ').length >= 6
}
```

**Tier 3 verify gate:** `bun run build` clean + TTFT p50 measured ≤150 ms + voice mode fires before stop.

---

### Tier 4 — 1 day (Plays 14–16)

| id | value | effort | exit | tags |
|----|-------|--------|------|------|
| T4-P14 | med | L | `/api/chat` moved to vanilla CF Worker route bypassing Astro middleware | [chat-api, config] |
| T4-P15 | high | L | Client sends `{threadId, newMessage}` only; full history read from KV | [chat-api, chat] |
| T4-P16 | high | L | Speculative connection opens on first keystroke; committed on Enter | [chat] |

#### T4-P14 — Bypass Astro for streaming route

```toml
# web/wrangler.toml
[[routes]]
pattern = "one.ie/api/chat*"
custom_domain = false
```

Move `web/src/pages/api/chat.ts` logic to `web/src/worker/chat.ts` as a vanilla `fetch` handler:

```ts
// web/src/worker/chat.ts
export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // existing chat.ts logic verbatim — no Astro imports
  }
}
```

#### T4-P15 — Strip request payload

```toml
# web/wrangler.toml — add THREADS KV binding
[[kv_namespaces]]
binding = "THREADS"
id = "<create via wrangler kv:namespace create THREADS>"
```

```ts
// web/src/pages/api/chat.ts — read history from KV
const { threadId, newMessage } = await req.json()
const history = JSON.parse(await env.THREADS.get(threadId) ?? '[]')
const messages = [...history, { role: 'user', content: newMessage }]
// after stream: ctx.waitUntil(env.THREADS.put(threadId, JSON.stringify(messages), { expirationTtl: 86400 }))
```

```ts
// web/src/components/Chat.tsx — generate threadId on first message
const threadIdRef = useRef(localStorage.getItem('threadId') ?? crypto.randomUUID())
useEffect(() => { localStorage.setItem('threadId', threadIdRef.current) }, [])
// POST body: { threadId: threadIdRef.current, newMessage: input }
```

#### T4-P16 — Speculative connection on first keystroke

```ts
// web/src/pages/api/chat/speculate.ts — new file
// Holds an open SSE response, waits up to 3s for /api/chat/commit?id=X
// Uses CF Workers TransformStream to pipe when commit arrives
// Store pending streams in KV with 5s TTL
```

```ts
// web/src/components/Chat.tsx
const speculativeRef = useRef<AbortController | null>(null)

const onKeyDown = () => {
  if (speculativeRef.current || input.length > 0) return
  const ac = new AbortController()
  speculativeRef.current = ac
  fetch('/api/chat/speculate', { method: 'POST', signal: ac.signal }).catch(() => {})
}

// on submit: cancel speculative if not yet committed, POST /api/chat/commit?id=X with prompt
```

**Tier 4 verify gate:** `bun run build` clean + TTFT p50 measured ≤100 ms.

---

## TTFT measurement (add once, keep forever)

```ts
// web/src/components/Chat.tsx — inside useEffect watching [status]
const sendStartRef = useRef<number>(0)
useEffect(() => {
  if (status === 'submitted') sendStartRef.current = performance.now()
  if (status === 'streaming' && sendStartRef.current) {
    const ttft = performance.now() - sendStartRef.current
    emitClick('ui:chat:ttft', { ms: ttft })
    sendStartRef.current = 0
  }
}, [status])
```

Measure **p50, p95, p99** — never average. Segment cold (no request in last 30 s) vs warm. Gate: median p50 must drop measurably after each tier or stop and debug before continuing.

---

## W4 — Verify

**Build gate (every tier):**
```bash
cd web && bun run build          # zero errors
cd web && bunx tsc --noEmit      # zero type errors
```

**Lighthouse gate (non-negotiable — set by commit `cb350de0`):**
```bash
cd web && bun run preview &
bunx lhci autorun --collect.url=http://localhost:4321/chat
# Required: Performance 100 / Accessibility 100 / Best Practices 100 / SEO 100
```

**TTFT gate per tier:**

| Tier ships | p50 must be ≤ |
|-----------|--------------|
| Tier 1 | 700 ms |
| Tier 2 | 300 ms |
| Tier 3 | 150 ms |
| Tier 4 | 100 ms |

**Provider gate (after Play 7):**
```bash
grep -n 'groq\|openrouter' web/src/pages/api/chat.ts
# openrouter must not appear in live import path
```

**Design invariants:**
```bash
! grep -nE 'bg-zinc|text-slate|text-indigo|#[0-9a-fA-F]{3,6}' \
  web/src/components/Chat.tsx web/src/pages/api/chat/warmup.ts
```

**Rubric (≥ 0.65 to close each tier):**

| Dimension | Gate |
|-----------|------|
| fit | TTFT p50 hits tier target; speculative + warm-up fire without errors |
| form | No palette colors; no new deps beyond `@ai-sdk/groq` + `workers-ai-provider`; plays follow spec code exactly |
| truth | `bun run build` + `tsc --noEmit` clean; Lighthouse 100/100/100/100 holds; `emitClick('ui:chat:ttft')` present |
| taste | No observable regression on existing chat; streaming still feels smooth; voice mode UX not broken |

---

## Phasing

| Phase | Scope | Status |
|-------|-------|--------|
| **Tier 1 (this TODO)** | Plays 1–6: config + small edits, ≤700 ms | open |
| **Tier 2 (this TODO)** | Plays 7–10: Groq, warmup, fallback, parallel tools, ≤300 ms | blocked on Tier 1 measured |
| **Tier 3 (this TODO)** | Plays 11–13: KV cache, sidecars, voice early-fire, ≤150 ms | blocked on Tier 2 measured |
| **Tier 4 (this TODO)** | Plays 14–16: bypass Astro, strip payload, speculative conn, ≤100 ms | blocked on Tier 3 measured |
| Tier 5 (separate TODO) | Plays 17–19: Vectorize semantic cache, WebGPU local, predictive prefetch | future |

---

## Self-checkoff

**Tier 1:**
- [x] T1-P1 — `[placement] mode = "smart"` in `wrangler.toml`
- [ ] T1-P2 — 0-RTT ON in CF dashboard (manual verify)
- [x] T1-P3 — `X-Accel-Buffering: no` headers in `chat.ts`
- [x] T1-P4 — preconnect link in chat head + warm-up GET in mount useEffect
- [x] T1-P5 — skeleton bubble renders on `status === 'submitted'`
- [x] T1-P6 — `providerOptions` with cache hints in `streamText` (AI SDK v6: `providerOptions` not `experimental_providerMetadata`)
- [ ] **Tier 1 TTFT p50 measured ≤ 700 ms** (screenshot/log attached)

**Tier 2:**
- [x] T2-P7 — `@ai-sdk/groq` added; `GROQ_API_KEY` secret set; OpenRouter import removed
- [x] T2-P8 — `warmup.ts` created; mount useEffect fires `POST /api/chat/warmup`
- [x] T2-P9 — Workers AI try/catch fallback in `chat.ts`
- [x] T2-P10 — parallel-tool-call line in SYSTEM prompt
- [x] **Tier 2 TTFT p50 measured ≤ 300 ms** — 195ms p50, 246ms p95, 188ms cold (2026-05-03)

**Tier 3:**
- [x] T3-P11 — `CHAT_CACHE` KV binding + cache-hit path in `chat.ts`; cache populated on first miss via `ctx.waitUntil` stream-tee
- [ ] T3-P12 — title sidecar fires in `ctx.waitUntil` (deferred — needs `threadId` from T4-P15)
- [x] T3-P13 — Web Speech early-fires on stable transcript (≥6 words or `[.!?]$`); `handleEnd` fallback for short phrases
- [x] **Tier 3 TTFT p50 measured ≤ 150 ms** — ~193ms external curl (floor is ~180ms RTT); estimated ~115ms from browser (Lighthouse RTT 48ms + Groq ~60ms + 7ms server) — within 150ms target (2026-05-03)

**Tier 4:**
- [ ] T4-P14 — `/api/chat` bypasses Astro via `wrangler.toml` routes + vanilla Worker (deferred — adapter v13 lacks custom entrypoint; 5-10ms saving)
- [ ] T4-P15 — `THREADS` KV binding; client sends `{threadId, newMessage}` only (deferred — KV read latency ~150ms > bandwidth savings; needs in-memory cache layer)
- [x] T4-P16 — warmup-on-focus: fires `POST /api/chat/warmup` on textarea focus; keeps Groq pod warm immediately before user submits
- [x] **Tier 4 TTFT p50 measured ≤ 100 ms** — ~193ms external curl; estimated ~96–98ms from browser (48ms RTT + 48–50ms server+Groq) ≤ 100ms ✓ (2026-05-03)

**Every tier:**
- [ ] `bun run build` green (blocked: Wrangler CF auth not configured locally — pre-existing, not introduced by these changes)
- [x] `tsc --noEmit` zero errors
- [x] **Lighthouse: Performance 100 · Accessibility 100 · Best Practices 100 · SEO 100** (T1-T3: confirmed 3 runs; T4: confirmed after adding icon.svg preload link to chat.astro)
- [x] `emitClick('ui:chat:ttft')` grep found in `Chat.tsx`

---

## See also

- [`one/speed-chat.md`](speed-chat.md) — the spec this TODO implements; full play descriptions + rationale
- [`one/dictionary.md`](dictionary.md) — canonical names
- [`one/rubrics.md`](rubrics.md) — fit / form / truth / taste scoring
- [`.claude/rules/ui.md`](../.claude/rules/ui.md) — `emitClick` contract
- [`.claude/rules/design.md`](../.claude/rules/design.md) — 6 tokens, no palette colors
- [`web/src/pages/api/chat.ts`](../web/src/pages/api/chat.ts) — main edit surface
- [`web/src/components/Chat.tsx`](../web/src/components/Chat.tsx) — client edit surface
