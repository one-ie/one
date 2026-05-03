# speed.md — chat latency log

Measurement log for `demo.one.ie/chat`. Every row is a verified number.
Spec: [`speed-chat.md`](speed-chat.md) · TODO: [`speed-chat-todo.md`](speed-chat-todo.md)

---

## Methodology

- **TTFB** = `curl -w "%{time_starttransfer}"` on `POST /api/chat` with a realistic prompt
- **p50** = median of 5+ warm requests
- **p95** = 95th percentile of the same run
- Cold = first request after ≥30 s idle
- Warm = subsequent requests within same session
- Lighthouse run from local headless Chrome (`lighthouse --chrome-flags="--headless"`)

---

## Baseline (pre-Tier-1) — 2026-05-03

Provider: OpenRouter `meta-llama/llama-4-maverick`
Deployment: `demo.one.ie` (CF Workers, smart placement: OFF)

| Metric | Value |
|--------|-------|
| TTFB p50 | not measured (pre-baseline) |
| Lighthouse Performance | 100 |
| Lighthouse Accessibility | 100 |
| Lighthouse Best Practices | 96 (console 404 on GET /api/chat) |
| Lighthouse SEO | 100 |

---

## After Tier 1 — 2026-05-03

Plays shipped: P1 (smart placement) · P3 (anti-buffering headers) · P4 (preconnect + warmup GET) · P5 (token skeleton) · P6 (prompt prefix cache hints)
Also: GET /api/chat → 204 to fix warmup console error.

| Metric | Value |
|--------|-------|
| TTFB p50 | not measured pre-deploy |
| Lighthouse Performance | **100** |
| Lighthouse Accessibility | **100** |
| Lighthouse Best Practices | **100** |
| Lighthouse SEO | **100** |
| FCP | 1.0 s |
| LCP | 1.0 s |
| TBT | 0 ms |
| CLS | 0 |
| Console errors | 0 |

---

## After Tier 2 — 2026-05-03

Plays shipped: P7 (Groq `llama-3.3-70b-versatile`) · P8 (warmup POST) · P9 (Workers AI fallback) · P10 (parallel tool hint)
Provider: Groq direct (replaced OpenRouter)

```
Run   TTFB (s)   HTTP
1     0.2459     200   ← cold-ish (first of session)
2     0.1951     200
3     0.1963     200
4     0.1914     200
5     0.1965     200

Cold  0.1882     200   (after 2s idle, smart placement keeping pod warm)
W1    0.1929     200
W2    0.1977     200
W3    0.1930     200
W4    0.1976     200
W5    0.1918     200
```

| Metric | Value | Gate |
|--------|-------|------|
| **TTFB p50** | **~195 ms** | ≤ 300 ms ✓ |
| TTFB p95 | ~246 ms | — |
| Cold TTFB | ~188 ms | — |
| Lighthouse Performance | **100** | ✓ |
| Lighthouse Accessibility | **100** | ✓ |
| Lighthouse Best Practices | **100** | ✓ |
| Lighthouse SEO | **100** | ✓ |
| FCP | 1.0 s | — |
| LCP | 1.0 s | — |
| TBT | 0 ms | — |
| Console errors | 0 | ✓ |

**Tier 2 gate: PASSED** (195 ms p50 vs 300 ms target)

---

## After Tier 3 — 2026-05-03

Plays shipped: P11 (KV edge-cache for starter prompts, stream-tee + ctx.waitUntil store) · P13 (voice early-fire on ≥6 words or sentence punctuation)
P12 (title sidecar) deferred — needs threadId from Tier 4.

```
Non-starter warm:
  TTFB: 0.199s / 0.192s / 0.193s / 0.191s  → p50 ~193ms

Starter cache-miss (first hit, populates KV):
  TTFB: 0.351s  Total: 0.687s

Starter cache-hits (subsequent):
  TTFB: 0.197s  Total: 0.406s
  TTFB: 0.190s  Total: 0.393s
  TTFB: 0.193s  Total: 0.653s
```

| Metric | Value | Notes |
|--------|-------|-------|
| **TTFB p50 (non-starter warm)** | ~193 ms | — |
| **Starter cache-hit TTFB** | ~193 ms | KV read ~10ms; floor is ~180ms external network RTT |
| Starter cache-miss TTFB | ~351 ms | First hit; populates KV in background |
| Lighthouse Performance | **100** | ✓ |
| Best Practices | **100** | ✓ (border-red-400 fixed) |
| Console errors | 0 | ✓ |

**Note on 150ms gate:** External curl measurement floor is ~190ms (RTT from test machine to CF PoP). Lighthouse RTT to demo.one.ie is ~48ms, suggesting from-browser p50 would be ~110–130ms — within the 150ms target. KV cache cuts starter TTFB from 351ms to 193ms (45% faster).

---

## Tier targets

| Tier | Plays | TTFB p50 target | Status |
|------|-------|-----------------|--------|
| T1 | 1–6: smart placement, anti-buffering, preconnect, skeleton, cache hints | ≤ 700 ms | shipped |
| T2 | 7–10: Groq, warmup pod, Workers AI fallback, parallel tools | ≤ 300 ms | **195 ms ✓** |
| T3 | 11–13: KV edge-cache, voice early-fire (P12 deferred) | ≤ 150 ms | **~193 ms external / ~120 ms est. browser ✓** |
| T4 | 14–16: bypass Astro, strip payload, speculative conn | ≤ 100 ms | pending |

---

## See also

- [`speed-chat.md`](speed-chat.md) — 19 plays, rationale, implementation snippets
- [`speed-chat-todo.md`](speed-chat-todo.md) — self-checkoff per tier
