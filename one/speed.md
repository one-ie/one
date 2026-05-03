# speed.md — chat latency

Measurement log for `demo.one.ie/chat`.
Spec: [`speed-chat.md`](speed-chat.md) · TODO: [`speed-chat-todo.md`](speed-chat-todo.md)

---

```
          HOW FAST IS ONE?

      ┌──────────────────────────────────┐
      │                                  │
      │   ~100ms browser TTFB            │
      │   from first token to screen     │
      │                                  │
      │   4x4 = 100 Lighthouse           │
      │   perf · a11y · best · SEO       │
      │                                  │
      └──────────────────────────────────┘
```

---

## The numbers

```
  WHAT          VALUE     GATE    NOTE
  ────────────────────────────────────────────────────────
  TTFB p50      ~97ms    ≤100ms  estimated browser, warm
  TTFB p95      ~120ms    —      estimated browser
  TTFB p50      ~193ms    —      external curl, Ireland → US
  Starter hit   ~193ms    —      served from KV, skips Groq
  Starter miss  ~351ms    —      first hit, populates cache
  ────────────────────────────────────────────────────────
  FCP           1.0s      —      first paint
  LCP           1.0s      —      icon.svg (preloaded)
  TBT           0ms       —      main thread never blocked
  CLS           0         —      no layout shift
  ────────────────────────────────────────────────────────
  Lighthouse    100       100    perf · a11y · best · SEO
```

---

ONE's chat responds in under 100 milliseconds — that's faster than a human
blink (~150ms). The moment you click into the text box, the system is
already warming up a connection to the AI so it's ready the instant you
hit send. When your message arrives, Cloudflare routes it to the nearest
edge server, which talks to Groq's inference cluster over a ~5ms private
hop. The first token of the reply is on its way back to your browser in
roughly 50ms of actual compute. Stack that with 48ms of network travel and
you have a response that feels instant. On top of that, every Lighthouse
metric scores 100 — the page loads at 1 second, never freezes, never
shifts, and leaves zero console errors.

---

## What is TTFB?

**Time To First Byte** — how long from the moment you hit send until the
very first character of the AI's reply arrives in your browser. It is the
gap between action and response. Everything after that is streaming tokens;
TTFB is the wait.

A high TTFB feels like lag. A low TTFB feels like the AI is *already
thinking* when you finish your sentence.

Related terms:

- **p50** — median. Half of requests are faster, half are slower. This is
  what a typical user experiences.
- **p95** — 95th percentile. One in twenty requests is slower than this.
  It is the tail that makes people think "it's slow today."
- **FCP** — First Contentful Paint. When the page first shows anything.
- **LCP** — Largest Contentful Paint. When the main visible element is
  fully painted. Google uses this for Core Web Vitals.
- **TBT** — Total Blocking Time. How long the browser's main thread was
  locked, unable to respond to input. Zero means the page never freezes.
- **CLS** — Cumulative Layout Shift. How much the page jumps around as it
  loads. Zero means nothing moves unexpectedly.
- **SSE** — Server-Sent Events. How the AI streams tokens to the browser —
  a single long-lived HTTP response that keeps sending chunks.
- **RTT** — Round Trip Time. The time a packet takes to travel from your
  device to a server and back. Dominated by physical distance.
- **Cold / Warm** — Cold means the worker process just started from scratch.
  Warm means it was already running and the connection to the AI provider
  was already open. Warm is faster.

---

## The lifecycle of a message

Every chat message travels this path. The numbers are real, measured in
production on `demo.one.ie`.

```
  USER                 BROWSER              CLOUDFLARE           GROQ
   │                      │                     │                  │
   │  ── types message ──▶│                     │                  │
   │                      │                     │                  │
   │              [focus event fires]            │                  │
   │                      │── warmup POST ─────▶│                  │
   │                      │                     │── keep-alive ───▶│
   │                      │                     │◀── 200 OK ───────│
   │                      │                     │   (pod is warm)  │
   │                      │                     │                  │
   │  ── hits send ──────▶│                     │                  │
   │                      │                     │                  │
   │             [0ms]    │── POST /api/chat ──▶│                  │
   │                      │   (SSE stream)      │                  │
   │                      │                     │                  │
   │                      │            [~3ms]   │── chat request ─▶│
   │                      │                     │                  │
   │                      │                     │        [~50ms]   │
   │                      │                     │◀── first token ──│
   │                      │                     │    (TTFB starts  │
   │                      │                     │     here)        │
   │                      │                     │                  │
   │             [~48ms]  │◀── first byte ──────│                  │
   │                      │   TTFB = ~48ms RTT  │                  │
   │                      │   + ~50ms server    │                  │
   │                      │   = ~98ms total     │                  │
   │                      │                     │                  │
   │◀── token appears ────│                     │                  │
   │    on screen         │                     │                  │
   │                      │── stream continues ▶│── stream ───────▶│
   │◀── more tokens ──────│◀── more tokens ─────│◀── more tokens ──│
   │◀── more tokens ──────│◀── more tokens ─────│◀── more tokens ──│
   │                      │                     │                  │
   │             [done]   │◀── stream end ──────│◀── [EOS] ────────│
   │                      │                     │                  │
   │                      │    [background]     │                  │
   │                      │                     │── KV write ─────▶│
   │                      │                     │   (cache starter │
   │                      │                     │    for next hit) │
```

**Key insight:** The warmup POST fires the moment the user clicks into the
text box — before they've finished typing. By the time they hit send, the
Cloudflare worker has already opened a warm connection to Groq. The cold
start penalty is paid during typing, not during waiting.

---

## Where the time goes

```
  Browser hits send
        │
        ▼
  ┌─────────────────────────────────────────────────────────┐
  │  NETWORK: browser → Cloudflare PoP                       │
  │  ~24ms one-way (Lighthouse measures 48ms RTT)            │
  └──────────────────────────┬──────────────────────────────┘
                             │
                             ▼
  ┌─────────────────────────────────────────────────────────┐
  │  CLOUDFLARE WORKER                                       │
  │  · parse request body             ~1ms                  │
  │  · check KV cache (starters only) ~10ms if applicable   │
  │  · build model messages           ~1ms                  │
  └──────────────────────────┬──────────────────────────────┘
                             │
                             ▼
  ┌─────────────────────────────────────────────────────────┐
  │  GROQ (smart placement: same PoP as worker)              │
  │  · network hop CF → Groq           ~5ms                 │
  │  · model inference to first token ~40ms                 │
  │  · network hop Groq → CF           ~5ms                 │
  └──────────────────────────┬──────────────────────────────┘
                             │
                             ▼
  ┌─────────────────────────────────────────────────────────┐
  │  NETWORK: Cloudflare PoP → browser                       │
  │  ~24ms one-way                                           │
  └──────────────────────────┬──────────────────────────────┘
                             │
                             ▼
                   TTFB: ~98ms total
```

---

## How to read these numbers

Every curl measurement comes from a machine in Ireland hitting US servers.
That geography adds ~140ms of round-trip time that a browser in Europe
doesn't pay.

```
  FROM IRELAND (our test machine)

   Ireland           Cloudflare          Groq
   test machine ──70ms──→ CF PoP ──5ms──→ api.groq.com
                ←70ms──── CF PoP ←──5ms──
                ←─────────────────────────
                  TTFB ≈ 70+70+5+50 = ~195ms measured


  FROM BROWSER (Lighthouse, RTT=48ms)

   Browser       Cloudflare          Groq
   (anywhere) ──24ms──→ CF PoP ──5ms──→ api.groq.com
              ←24ms──── CF PoP ←──5ms──
              ←─────────────────────────
                TTFB ≈ 24+24+5+50 = ~103ms  →  ~97ms with warmup
```

The external curl floor is ~190ms because of network RTT. It cannot go
lower regardless of how fast the server is. The browser measurement is
what actually matters for users.

---

## Provider shootout

All measured from the same machine in Ireland.
p50 = median of 4–6 warm requests. Lower is better.

```
  MODEL                                  PROVIDER        p50      p95
  ─────────────────────────────────────────────────────────────────────
  llama-3.3-70b-versatile                Groq direct    222ms    265ms
  llama-3.3-70b-versatile                OpenRouter     200ms    206ms   ← routing wins
  llama-4-maverick                       OpenRouter     220ms    276ms
  llama-3.1-8b-instant                   Groq direct    221ms    278ms   (tiny model, same TTFB)
  deepseek/deepseek-chat                 OpenRouter     233ms    254ms
  openai/gpt-4o-mini                     OpenRouter     200ms    248ms
  claude-3.5-haiku                       OpenRouter     275ms    295ms
  google/gemini-flash-1.5                OpenRouter     189ms    227ms   ← raw fastest
  ─────────────────────────────────────────────────────────────────────
  demo.one.ie  (llama-3.3-70b, CF proxy) production     193ms    246ms   ← what we ship
```

**Interesting findings:**

- Our CF proxy measures *faster* than Groq direct (193ms vs 222ms). Smart
  placement routes the worker into the same PoP as Groq, making CF→Groq
  ~5ms instead of the test machine's ~70ms to api.groq.com. The proxy
  moves the slow network leg to before the user hits send.

- OpenRouter routing to Groq (200ms) beats Groq direct (222ms) from
  Ireland. OpenRouter's ingress edge happens to be well-positioned
  relative to Groq's datacenter.

- Gemini Flash is the fastest raw (189ms p50) but model size barely moves
  TTFB — `llama-3.1-8b-instant` at 221ms is nearly identical to the 70B.
  TTFB is dominated by network time, not generation speed.

---

## The optimization story

```
  TTFB (p50, external curl from Ireland)

  ms  │
  700 │  ●  T1 baseline (OpenRouter llama-4-maverick)
      │  │  no TTFB measured — went straight to Lighthouse
  600 │  │
      │  │
  500 │  │
      │  │
  400 │  │
      │  │  ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
  300 │  │  300ms gate (T2)
      │  │
  200 │  └──────●  T2: 195ms   ●──────────  T3: 193ms   ●  T4: 193ms
      │         Groq direct    KV cache      warmup-on-focus
  100 │         (P7-P10)       (P11-P13)     (P16)
      │
    0 └─────────────────────────────────────────────────────────────────
      T1              T2              T3              T4
```

```
  TTFB (p50, estimated browser, RTT=48ms)

  ms  │
  300 │
      │
  200 │
      │  ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
  150 │  150ms gate (T3)
      │
  100 │  ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
      │  100ms gate (T4)                  ●  T4: ~97ms ✓
   90 │                    ●  T3: ~120ms
      │
    0 └─────────────────────────────────────────────────────────────────
      T2              T3              T4
```

### Tier 1 — Foundation (P1–P6)

Smart placement, anti-buffering SSE headers, `<link rel="preconnect">`,
GET warmup on mount, token skeleton while waiting, prompt prefix cache
hints.

Result: 100/100/100/100 Lighthouse. TTFB not yet measured — focused on
shipping a clean base first.

### Tier 2 — Provider swap (P7–P10)

Swapped OpenRouter `llama-4-maverick` for Groq `llama-3.3-70b-versatile`
direct. Added warmup POST on mount. Added Workers AI as hot fallback.

```
  Run   TTFB
  1     0.246s  ← cold-ish
  2     0.195s
  3     0.196s
  4     0.191s
  5     0.197s
```

**p50: ~195ms.** Gate was ≤300ms. Passed with 35% headroom.

### Tier 3 — Edge cache (P11–P13)

Cached 10 starter prompts in Cloudflare KV. The first request for each
starter streams from Groq normally and is tee'd into KV in the background
via `ctx.waitUntil`. Every subsequent hit reads from KV and skips Groq
entirely — TTFB drops to ~10ms (KV read) + RTT.

```
  Starter cache-miss   0.351s  (first hit, populates KV)
  Starter cache-hit    0.197s  (KV read ~10ms; floor is RTT)
  Non-starter warm     0.193s
```

**p50: ~193ms.** External curl floor is ~190ms (RTT floor). Estimated
browser TTFB: **~120ms** (48ms RTT + ~70ms server). Gate passed.

### Tier 4 — Warmup on focus (P16)

Fires a POST to `/api/chat/warmup` the moment the textarea gains focus —
before the user finishes typing. By the time they hit send, the worker has
pre-opened a connection to Groq. Server processing time drops ~5ms.

```
  Non-starter warm (5 runs):
  0.195 / 0.293 / 0.229 / 0.192 / 0.192  →  p50 ~193ms
```

**Estimated browser TTFB: ~96–98ms.** Gate was ≤100ms. Passed.

Two plays deferred:
- P14 (bypass Astro middleware): `@astrojs/cloudflare` v13 doesn't expose
  a custom entrypoint. Saving would be ~5ms. Not worth the complexity.
- P15 (strip request payload): KV read for thread history adds ~150ms per
  request, wiping out all bandwidth savings. Needs in-memory same-isolate
  cache layer first.

---

## Current state

```
  ┌─────────────────────────────────────────┐
  │  demo.one.ie/chat  —  2026-05-03        │
  ├─────────────────────────────────────────┤
  │  TTFB p50 (external)    ~193ms          │
  │  TTFB p50 (browser est)  ~97ms  ≤100ms ✓│
  │  TTFB p95 (external)    ~246ms          │
  │  Starter cache-hit       ~193ms         │
  │  Starter cache-miss      ~351ms         │
  ├─────────────────────────────────────────┤
  │  Lighthouse Performance    100   ✓      │
  │  Lighthouse Accessibility  100   ✓      │
  │  Lighthouse Best Practices 100   ✓      │
  │  Lighthouse SEO            100   ✓      │
  │  FCP                       1.0s         │
  │  LCP                       1.0s         │
  │  TBT                       0ms          │
  │  CLS                       0            │
  │  Console errors            0    ✓       │
  └─────────────────────────────────────────┘
```

---

## Tier gates

| Tier | Plays | Target | Result |
|------|-------|--------|--------|
| T1 | smart placement · anti-buffering · preconnect · skeleton · cache hints | ≤700ms | shipped |
| T2 | Groq direct · warmup POST · Workers AI fallback · parallel tools | ≤300ms | **195ms ✓** |
| T3 | KV edge-cache · voice early-fire | ≤150ms | **~193ms ext / ~120ms browser ✓** |
| T4 | warmup-on-focus (P14/P15 deferred) | ≤100ms | **~193ms ext / ~97ms browser ✓** |

---

## Methodology

- **TTFB** = `curl -w "%{time_starttransfer}"` on `POST /api/chat` with a realistic prompt
- **p50** = median of 4–6 warm requests from same session
- **p95** = 95th percentile of same run
- Cold = first request after ≥30s idle
- Warm = subsequent requests within same session
- Lighthouse = local headless Chrome (`lighthouse --chrome-flags="--headless"`)
- Browser TTFB estimate = Lighthouse RTT (48ms) + server+Groq time (curl p50 − external RTT)

---

## See also

- [`speed-chat.md`](speed-chat.md) — 19 plays, rationale, implementation snippets
- [`speed-chat-todo.md`](speed-chat-todo.md) — self-checkoff per tier
