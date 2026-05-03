# speed-chat.md — fastest AI chat, zero marginal cost

**Target:** TTFT (time to first token) **under 100 ms p50** with **$0
marginal cost per user** above the LLM-token floor we'd pay anyway.

**The shape of this doc:** plays are ordered **by time-to-ship**, not by
impact. Tier 1 plays each take ≤5 minutes. Tier 5 plays take a week. Ship
top-down — every tier compounds on the last, and the easy wins are
embarrassingly easy.

**The bet:** Tier 1 + Tier 2 alone (≤2.5 hours of work) takes you from
~1000 ms TTFT to **under 200 ms**. That's 80% of the final win in 20% of
the work. Don't skip ahead.

---

## What "free" means here

Every play satisfies one of:

1. **Free by config** — flip a flag, edit a header, change a placement
2. **Free by architecture** — same cost, less work (cache, payload trim, prefix reuse)
3. **Free by relocation** — work moves to the user's hardware (browser WebGPU, Web Speech API)
4. **Net-negative** — replaces an expensive thing with a cheaper one (Groq vs OpenRouter, cached prefixes vs full prefill)

Cloud freebies leveraged:
- Cloudflare **KV** — 100k reads/day, 1k writes/day free tier
- Cloudflare **Workers AI** — 10k neurons/day free tier (used for sidecars)
- Cloudflare **Workers** — 100k requests/day free tier
- Cloudflare **Vectorize** — 30M dims + 50M queries/mo free tier
- **Provider prompt caching** — discounts cached prefixes automatically
- **WebGPU + Web Speech API** — runs on user's hardware (free to us)
- **HTTP/3 0-RTT, preconnect, Smart Placement** — pure config

Below ~10K MAU all of this stays inside free-tier limits.

---

## Pipeline today

```
keystroke → Enter
  ↓
React submit handler                    ~5 ms
  ↓
POST /api/chat                          ~30-60 ms     client → CF edge
  ↓
CF Worker boot (warm)                   ~5-15 ms
  ↓
fetch openrouter.ai/api/v1              ~30-150 ms    edge → US
  ↓
OpenRouter routing/auction              ~100-300 ms   pure overhead
  ↓
Provider (varies)                       ~30-80 ms
  ↓
Llama 4 Maverick — first token          ~400-700 ms   MoE warm-up
  ↓
stream back                             ~30-150 ms
```

**Today: 700–1500 ms.** Two thirds is removable for free.

Files in scope:
- [`web/src/pages/api/chat.ts`](web/src/pages/api/chat.ts) — worker handler
- [`web/src/components/Chat.tsx`](web/src/components/Chat.tsx) — client send path
- [`web/src/components/chat/MessageList.tsx`](web/src/components/chat/MessageList.tsx) — render path
- [`web/src/components/ai-elements/speech-input.tsx`](web/src/components/ai-elements/speech-input.tsx) — Web Speech wrapper
- [`web/src/pages/chat.astro`](web/src/pages/chat.astro) — page shell
- [`web/wrangler.toml`](web/wrangler.toml) — bindings, placement
- [`web/astro.config.mjs`](web/astro.config.mjs) — adapter

---

# Tier 1 — ship in 30 minutes

Six plays, each under 5 minutes. **Cumulative: ~20 minutes of typing.**

These are pure config. Zero code logic. Cumulative TTFT delta: **−150 to
−400 ms.** Stop reading and ship them right now.

---

### 1. Smart Placement *(1 line)*

Move the Worker close to the slow leg of the pipeline (the model provider).

```toml
# wrangler.toml
[placement]
mode = "smart"
```

CF auto-detects from telemetry which leg is slower (user→worker vs
worker→provider) and re-locates the worker. **−30 to −100 ms** once
adapted.

---

### 2. HTTP/3 0-RTT *(no code, dashboard verify)*

You already negotiate H3 (`alt-svc: h3=":443"`). TLS 1.3 0-RTT lets the
*second* request from a session skip the handshake entirely.

→ Cloudflare dashboard → SSL/TLS → Edge Certificates → **0-RTT Connection
Resumption: ON.**

**−30 to −50 ms** on subsequent requests.

---

### 3. Kill response buffering *(3 lines)*

CF sometimes buffers small streaming responses. Force flush on the SSE
endpoint:

**Edit:** [`web/src/pages/api/chat.ts:47`](web/src/pages/api/chat.ts)

```ts
return result.toUIMessageStreamResponse({
  headers: {
    'X-Accel-Buffering': 'no',
    'Cache-Control': 'no-cache, no-transform',
    'Content-Encoding': 'identity',
  },
})
```

**−20 to −100 ms** occasionally.

---

### 4. Preconnect + warm-up *(2 lines)*

Open the TCP+TLS socket and warm the worker before the user hits Enter.

**Edit 1:** [`web/src/pages/chat.astro`](web/src/pages/chat.astro) — add to `<head>` via Layout

```astro
<link rel="preconnect" href="/api/chat" />
<link rel="dns-prefetch" href="/api/chat" />
```

**Edit 2:** [`web/src/components/Chat.tsx`](web/src/components/Chat.tsx) — inside the existing mount `useEffect`

```ts
fetch('/api/chat', { method: 'GET' }).catch(() => {}) // returns 405; warms socket
```

**−50 to −150 ms** on cold connections. First message benefits most.

---

### 5. Optimistic UI placeholder *(small JSX block)*

The moment `status === 'submitted'`, render the response bubble with a
shimmer placeholder where the assistant's reply will land. The shimmer is
already in [`Chat.tsx:201`](web/src/components/Chat.tsx) for "Thinking…";
just add a token-shaped skeleton bubble.

**Perceived TTFT delta: −100 to −300 ms.** User sees motion before any
real token. The actual TTFT doesn't change but the *felt* speed does, and
that's what matters for product.

---

### 6. Prompt prefix caching *(config field)*

Every modern provider auto-caches identical prefixes and **charges less**
for the cached portion. Your system prompt + early messages don't change
between turns.

**Edit:** [`web/src/pages/api/chat.ts`](web/src/pages/api/chat.ts)

```ts
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

**Cost: negative** (cached tokens billed at 0.5–0.1× normal). **TTFT delta:
−50 to −150 ms per turn after the first.** Compounds with thread depth.

---

**End of Tier 1.** You should be sitting at ~600 ms TTFT now. Keep going.

---

# Tier 2 — ship in 2 hours

Four plays, each ~30 minutes. The biggest single win in the entire doc
lives here (Play 7).

Cumulative TTFT delta: **−500 to −800 ms** on top of Tier 1.

---

### 7. Drop OpenRouter, go Groq direct *(the single biggest win)*

OpenRouter is an auction layer that adds 100–300 ms of routing overhead.
Groq runs Llama on custom LPU silicon: TTFT typically 50–150 ms,
throughput 500+ tok/s on Llama 3.3 70B. **Pricing comparable or cheaper.**

**Edit:** [`web/src/pages/api/chat.ts:33-45`](web/src/pages/api/chat.ts)

```ts
import { createGroq } from '@ai-sdk/groq'
const groq = createGroq({ apiKey: env.GROQ_API_KEY })
const result = streamText({
  model: groq('llama-3.3-70b-versatile'),
  system: SYSTEM,
  messages: await convertToModelMessages(messages),
  experimental_providerMetadata: { /* keep prefix cache config from Play 6 */ },
})
```

```bash
cd web && bun add @ai-sdk/groq
wrangler secret put GROQ_API_KEY
```

**Cost:** net-zero or saves money vs current OpenRouter spend. Groq's free
tier covers 1M tokens/day. **TTFT delta: −400 to −600 ms — single largest
lever in the doc.**

---

### 8. Pre-warm the model pod *(one fetch, one route)*

When Chat hydrates, fire a `max_tokens: 1` request to the chosen provider.
Wakes their inference pod, primes their KV cache.

**Edit 1:** [`web/src/components/Chat.tsx`](web/src/components/Chat.tsx) — mount effect

```ts
fetch('/api/chat/warmup', { method: 'POST' }).catch(() => {})
```

**Edit 2:** new `web/src/pages/api/chat/warmup.ts` — fires a 1-token request
to Groq and discards the result.

**Cost:** ~$0.000001 per session — effectively free. **TTFT delta: −100 to
−300 ms** of provider cold start on first real message.

---

### 9. Workers AI fallback *(try/catch around primary)*

`wrangler.toml` already has `[ai] binding = "AI"`. Workers AI runs Llama
*in the same CF datacenter as the worker*. Use as fallback when Groq
errors or rate-limits.

```ts
import { createWorkersAI } from 'workers-ai-provider'
const ai = createWorkersAI({ binding: env.AI })

let result
try {
  result = streamText({ model: groq('llama-3.3-70b-versatile'), ... })
} catch {
  result = streamText({ model: ai('@cf/meta/llama-3.3-70b-instruct-fp8-fast'), ... })
}
```

**Cost:** free up to 10k neurons/day; cheap above. **TTFT delta:** when it
fires, ~50–150 ms (zero network hop) — and it shaves p99 from minutes
(when Groq has an outage) to milliseconds.

---

### 10. Parallel tool calls *(config + system prompt line)*

When an agent calls multiple tools, run them concurrently. AI SDK does
this automatically when the model emits parallel `tool_call` entries — most
modern models do. Add to system prompt:

> *"When tools are independent, call them in parallel."*

For a 3-tool agent today (sequential ~1000 ms): becomes
`max(t1, t2) + t3` ≈ ~800 ms.

**Cost:** $0 (same total tokens). **TTFT delta:** scales with tool count;
~200 ms for typical 3-tool flows.

---

**End of Tier 2.** You should be at ~150–300 ms TTFT now. **This is
already faster than every public chat product on the internet.**

---

# Tier 3 — ship in half a day

Three plays, each ~2 hours.

Cumulative TTFT delta: **−50 to −150 ms** plus collapses time-to-rich
output and time-to-voice-response.

---

### 11. Edge-cache the starter answers

The 4 starter buttons ("What is ONE?", "Show highways", "How do I sell a
skill?", "How do I buy?") are deterministic prompts. Cache the full
responses in CF KV with stale-while-revalidate.

**Edit:** [`web/src/pages/api/chat.ts`](web/src/pages/api/chat.ts)

```ts
const cacheKey = `chat:starter:${hash(SYSTEM + STARTER_PROMPT)}`
const cached = await env.CHAT_CACHE.get(cacheKey, 'stream')
if (cached) {
  ctx.waitUntil(regenerateAndStore(cacheKey))
  return new Response(cached, { headers: SSE_HEADERS })
}
// else stream fresh + write to KV in waitUntil()
```

Pre-warm the cache from a build step so day 1 is instant.

**Cost:** $0 (KV free tier). **TTFT for starter clicks: ~10 ms.** Hits on
every cold visit.

---

### 12. Sidecar enrichers on Workers AI free tier

Main agent (Groq) generates the answer. **Sidecars** run in parallel on
Workers AI free tier:

- **Citation sidecar** — small embedding model finds inline citations
- **Code-highlight sidecar** — pre-tokenizes code blocks via shiki on the worker (no model — pure compute, free)
- **Title sidecar** — `@cf/meta/llama-3.1-8b-instruct` generates a 1-line thread title for the sidebar (~50 tokens, ~10 ms)
- **TTS prefetch sidecar** — kicks off `/api/tts` while the response streams; audio is ready by the time user clicks "Speak"

**Cost:** $0 within Workers AI free tier (10k neurons/day = ~100k small
calls). **Doesn't reduce raw TTFT** — reduces total time-to-rich-experience.

---

### 13. Web Speech early-fire *(voice mode goes negative)*

Browser's Web Speech API streams transcription incrementally — no Whisper
API needed. Current `SpeechInput` already uses it. The change: **fire the
chat request when the transcript stabilizes, before the user stops
talking.**

**Edit:** [`web/src/components/ai-elements/speech-input.tsx`](web/src/components/ai-elements/speech-input.tsx)

```ts
recognition.onresult = (e) => {
  const text = combineFinalResults(e)
  setTranscript(text)
  if (isStable(text) && !alreadyFired) submit(text)  // don't wait for end
}
```

By the time the user stops speaking, the response is already streaming.

**Cost:** $0 (browser-native). **Collapses 1.5–2 s of perceived voice
latency.** Tradeoff: quality varies by browser (Chrome > Safari > Firefox);
fall back to manual submit on poor recognition.

---

**End of Tier 3.** You should be at ~100–200 ms TTFT and have voice
response that feels telepathic.

---

# Tier 4 — ship in a day

Three plays, each ~half day. These are real architectural changes.

Cumulative TTFT delta: **−50 to −150 ms.**

---

### 14. Bypass Astro for the streaming route

`api/chat.ts` runs through Astro's server runtime — adds 5–15 ms of
routing/middleware. Move `/api/chat` to a vanilla CF Worker route declared
directly in `wrangler.toml`. Chat page stays Astro; only the streaming
route gets the metal.

```toml
# wrangler.toml
[[routes]]
pattern = "demo.one.ie/api/chat*"
custom_domain = false  # take precedence over the Astro adapter
```

`web/src/worker/chat.ts` becomes a vanilla `fetch` handler exporting
`{ async fetch(req, env, ctx) { ... } }`.

**Cost:** $0. **TTFT delta: −5 to −15 ms per request, every request.**

---

### 15. Strip request payload to {threadId, newMessage}

Today the client POSTs the full `UIMessage[]` array on every send (10–30
KiB at turn 20). Move history to KV (free tier covers ~5k MAU), send only
the delta.

**Edits:**
- [`web/src/pages/api/chat.ts`](web/src/pages/api/chat.ts) — KV read + write history
- [`web/src/components/Chat.tsx`](web/src/components/Chat.tsx) — generate threadId on first message, persist to localStorage
- [`web/wrangler.toml`](web/wrangler.toml) — add `THREADS` KV binding

**Cost:** $0 within KV free tier. **TTFT delta: −20 to −100 ms** on long
conversations. Bonus: history persists across reloads.

---

### 16. Speculative connection on first keystroke

Open the streaming connection on the first keystroke; commit on Enter.
Removes the entire TLS handshake from the critical path on submit.

**Edit:** [`web/src/components/Chat.tsx`](web/src/components/Chat.tsx)

```ts
const speculativeRef = useRef<AbortController | null>(null)
const onKeyDown = () => {
  if (speculativeRef.current) return
  const ac = new AbortController()
  speculativeRef.current = ac
  fetch('/api/chat/speculate', { method: 'POST', signal: ac.signal })
}
```

Server-side `/api/chat/speculate` holds an open response, waits up to 3 s
for `/api/chat/commit?id=X` to send the prompt, then streams through the
held connection.

**Cost:** $0 (CF Workers idle held connections free up to 30s). **TTFT
delta: −80 to −150 ms.**

---

**End of Tier 4.** TTFT should now be in the **50–150 ms range**.

---

# Tier 5 — ship in a week

Three frontier plays. Each is a real engineering project. **Don't start
these until everything above is shipped and measured.**

After this tier, TTFT effective approaches **0 ms** on predictable inputs.

---

### 17. Semantic cache via Vectorize

Embed every conversation prefix → store in CF Vectorize → k-NN search for
similar past prefixes on new messages. If similarity > 0.95, stream the
cached response through a small "edit pass" model that adapts it.

**Architecture:**
1. After each completed exchange, embed `prefix` (~ first 500 tokens) + store with `responseId` pointing to KV blob
2. On new message: embed → query Vectorize for top-1 similar at threshold 0.95
3. If hit: load cached response, run edit-pass via Workers AI to adapt deltas
4. Otherwise: normal flow + cache after stream closes

**Cost:** $0 within Vectorize free tier (30M dims + 50M queries/mo). For
10k MAU at 20 msgs/mo = 200k embeddings/mo, well inside.

**TTFT delta:** ~100 ms on cache hits regardless of thread length. Hit
rate 20–40% on real conversational chat.

---

### 18. WebGPU local model

Llama 3.2 1B-instruct in 4-bit quantization fits in ~700 MB and generates
~50 tok/s on M1 / RTX 3060 / mobile flagship via WebLLM. **Pre-load when
Chat hydrates** so it's ready by the time the user types.

**Edit:** [`web/src/components/Chat.tsx`](web/src/components/Chat.tsx)

```ts
import { CreateMLCEngine } from '@mlc-ai/web-llm'
const engineRef = useRef<MLCEngine | null>(null)
useEffect(() => {
  if (!supportsWebGPU()) return
  CreateMLCEngine('Llama-3.2-1B-Instruct-q4f32_1-MLC').then((e) => {
    engineRef.current = e
  })
}, [])
```

Use as **speculative draft** alongside server-side 70B (Tier 5 Play 19).
Local 1B starts streaming at ~30 ms; server 70B overtakes when its tokens
arrive (~150 ms).

**Cost:** $0 to us per request — runs on user's GPU. ~$50/mo CDN at scale
for the initial model download (cached on user's disk after first load).
**Tradeoff:** detect WebGPU + memory; fall back to server-only on phones
with <4 GB RAM, Safari < 17.4, low-end Androids.

**TTFT delta: −500 ms** on supported devices — first tokens in ~30 ms.

---

### 19. Predictive prefetch via the local model

Debounce textarea input by 80 ms. After every typing pause, the **local
WebGPU model** generates a predicted answer for the partial input, stored
in client memory. When user submits, if a prediction matches:

**TTFT effective ≈ 0 ms** — the answer was generated *while they were
still typing*.

**Edit:** [`web/src/components/Chat.tsx`](web/src/components/Chat.tsx)

```ts
const onChange = useDebouncedCallback(async (text) => {
  if (text.length < 8) return
  const prediction = await engineRef.current?.chat.completions.create({
    messages: [{ role: 'user', content: text }],
    max_tokens: 200, stream: false,
  })
  predictionsRef.current.set(text, prediction)
}, 80)
```

On submit: if `predictionsRef.current.get(text)` exists, stream the
prediction immediately while the server-side 70B prepares the real
response. Swap mid-stream when 70B's first token arrives.

**Cost:** $0 to us — all compute on user's GPU. Skip on mobile to save
battery.

---

**End of Tier 5.** TTFT is now bounded by the user's monitor refresh, not
the network or the model.

---

## Wave plan, condensed

| Tier | Time | Plays | Cost | Cumulative TTFT |
|---|---|---|---|---|
| **1** | 30 min | 1–6 | $0 | ~500–700 ms |
| **2** | 2 hr | 7–10 | $0 | **~150–300 ms** |
| **3** | half day | 11–13 | $0 | ~100–200 ms (voice: pre-stop response) |
| **4** | 1 day | 14–16 | $0 | ~50–150 ms |
| **5** | 1 week | 17–19 | $0 marginal | **~0–50 ms** ← target |

Ship top-down. **Don't start Tier 2 until Tier 1 is measured live.** Don't
start Tier 5 until everything else is. The entire doc compounds — the
final tier only works because the earlier tiers de-risked it.

---

## Measurement

Add a TTFT logger to [`Chat.tsx`](web/src/components/Chat.tsx):

```ts
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

Track per provider, per tier shipped:
- **p50, p95, p99** TTFT (don't average — distributions are bimodal)
- **Cold vs warm** — segment by whether a request was sent in last 30 s
- **Predicted vs not** — segment by whether Play 19 predicted correctly
- **Network type** — segment by `connection.effectiveType`

The `emitClick('ui:chat:ttft')` signal flows through the substrate per
[`engine.md`](web/.claude/rules/engine.md). Path strength on
`chat → groq` vs `chat → workersai` vs `chat → local-1b` self-tunes by
verified latency. The system learns which path is fastest *for this user,
this geography, this time of day, this device*. **No mark, no learning.**

After every tier ships: median p50 TTFT must drop measurably. If it
doesn't, the assumption was wrong — fix it before going on.

---

## Don't

- Don't start Tier 2 until Tier 1 is measured live. The whole point of
  the tiering is to compound on de-risked wins.
- Don't switch primary to a model smaller than 70B for the headline
  answer. Local 1B (Play 18) is the *speculative draft*, not the main
  response.
- Don't cache LLM responses beyond starters (Play 11) and semantic-similar
  pairs (Play 17). Conversation context is unique; raw hit rate is ~0%.
- Don't pre-stream tokens to the user before they submit. The model can't
  generate meaningful output without the prompt; you'd hallucinate.
- Don't add Whisper API for voice. Web Speech (Play 13) is free and fast
  enough.
- Don't add Durable Objects yet. The DO pin trick is real but it's not
  free — DO duration billing kicks in. Add it when scale justifies.
- Don't fire 2× provider racing. Doubles cost for marginal p99 wins. Use
  Workers AI (Play 9) as a *fallback*, not a co-runner.
- Don't ship the local model on devices that can't handle it (Play 18).
  Detect WebGPU + memory; fall back gracefully.

---

## The claim

After **Tier 1** (30 min, free): TTFT p50 ≈ **500 ms**, down from ~1000 ms.

After **Tier 2** (+2 hr, free): TTFT p50 < **300 ms.** On par with the
fastest production chat UIs (Perplexity, chat.com, Groq playground).

After **Tier 3** (+half day, free): TTFT p50 < **150 ms.** Voice mode
TTFT goes negative — response begins while user is still talking.

After **Tier 4** (+1 day, free): TTFT p50 < **100 ms.** The response
begins before the keystroke registers as complete.

After **Tier 5** (+1 week, $0 marginal): On predicted inputs **TTFT ≈ 0
ms** — the answer was generated while the user was typing.

**All of this for $0 marginal cost per user above the floor of LLM tokens
we'd pay anyway.**

That's the world's fastest free AI chat.

---

## The architectural through-line

Each play removes one assumption that something must be sequential, remote,
or expensive. The free version of "fastest" is the same physics, different
work-allocation.

| Sequential / remote / expensive assumption | Play that breaks it |
|---|---|
| Worker close to user, far from provider | Smart Placement (1) |
| TLS handshake before each request | 0-RTT (2), preconnect (4) |
| Mid-stream framing buffering | Buffering headers (3) |
| Empty bubble while waiting | Optimistic placeholder (5) |
| Tokenize prefix from scratch every turn | Prefix caching (6) |
| Chat → router → provider | Drop OpenRouter (7) |
| Cold provider pod on first message | Warm-up ping (8) |
| One provider per request | Workers AI fallback (9) |
| Serial tool calls | Parallel tool calls (10) |
| Fresh generation for repeat questions | Starter cache (11) |
| Wait for full enrichment before render | Sidecars (12) |
| Wait for user to finish speaking | Web Speech early-fire (13) |
| Astro middleware on the hot path | Bypass Astro (14) |
| Send full history every time | Strip payload (15) |
| Separate connection per submit | Speculative connection (16) |
| Recompute when a similar prefix exists | Semantic cache (17) |
| Inference always lives in the cloud | WebGPU local (18) |
| Wait for submit before generating | Predictive prefetch (19) |

The substrate's job is to coordinate this fan-out. Every parallel branch
emits its own signal, marks its own path, fades its own resistance. Width
= parallel branches per request (network, provider, local, sidecar). Depth
= the cycle that ships each play. Learning = pheromone strength on the
path that *actually* returns first for this user, this device, this
moment.

---

## What this rules out

The plays excluded from this doc — and the reasons — are worth naming so
the omission is intentional:

| Excluded play | Why |
|---|---|
| Dedicated Groq tenancy | $10–25k/mo enterprise minimum |
| Multi-region warm fleet | $30–100k/mo |
| Private peering / Magic Transit | $10–25k/mo |
| ONE-domain finetune | $5k+/mo recurring + ops cost |
| Always-on DO per active user | $0.10/active-user-hour scales linearly |
| 2× / 3× provider racing | Doubles or triples per-token spend |
| Speculative ensemble (8B + 70B simultaneous server-side) | 1.5× tokens per request |
| Decomposed multi-agent | 2–3× tokens per response |
| Whisper streaming for voice | $0.36/audio-hour |
| Server-side predictive prefetch on paid model | 100× inference quota |

These are real wins. They're just not free. They go in `speed-chat-paid.md`
when budget is available.

---

*Nineteen plays. All free. Five tiers. Ship top-down. Sub-50 ms p50 with
zero marginal cost — or it doesn't ship.*
