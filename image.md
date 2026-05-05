# image.md — image generation in /chat

**Mode:** lean · **Lifecycle:** construction
**Surface:** `/chat` (`web/src/pages/chat.astro` → `web/src/pages/api/chat.ts`)
**Why:** users currently can't create images from chat. The model is text-only; the `crawl` tool is the only one wired. Add a second tool — `image` — that uses Cloudflare Workers AI (already bound as `env.AI`).

---

## Classifier

| Prior | Y/N | Note |
| --- | --- | --- |
| Spec locked | Y | One tool, one model, one return shape |
| Variance known | Y | Base64 data URL ships first; R2 is a follow-up |
| Exit scalar | Y | "User types 'draw a fox' → image renders inline within 5s" |
| Files known | Y | `web/src/pages/api/chat.ts`, `web/wrangler.toml` |

4/4 → **lean**.

---

## Decision: model + delivery

**Model:** `@cf/black-forest-labs/flux-1-schnell` — fast (~2-4s), free tier (10k neurons/day).
Returns `{ image: <base64 jpeg> }` per Cloudflare docs (verified 2026-05-04). No `response_format` option; no streaming.

**Delivery:** **base64 data URL** in returned markdown — `![alt](data:image/jpeg;base64,…)`.
Reasons:
- ships today with zero infra (no new bindings, no DNS)
- existing markdown pipeline renders it inline
- KV chat cache (chat.ts:128) only fires on starter prompts, so image responses never hit it — base64 size doesn't matter for cache
- one image ≈ 100-300KB base64; tolerable for a single SSE response

**R2 + `img.one.ie` is explicitly out of scope** for this cycle. It needs a new bucket, a DNS record on a domain that currently only routes `demo.one.ie`, and a public-read policy review. Tracked as follow-up below.

---

## Tool shape

```ts
const imageSchema = z.object({
  prompt: z.string().min(3).max(500).describe('What to draw. Be visual and specific.'),
  steps: z.number().int().min(4).max(8).default(4).describe('Diffusion steps (4 = fast, 8 = sharper)'),
})

// Inside the tools object — gated on env.AI like crawl is gated on CF creds
...(env.AI ? {
  image: tool({
    description:
      'Generate an image from a text description. Use when the user asks to draw, create, ' +
      'render, illustrate, or generate a picture/image/photo of something.',
    inputSchema: imageSchema,
    execute: async ({ prompt, steps }) => {
      // Rate limit: 5 images / IP / hour via CHAT_CACHE KV
      const ip = request.headers.get('cf-connecting-ip') ?? 'anon'
      const rkey = `img-rl:${ip}:${new Date().toISOString().slice(0, 13)}` // hour bucket
      const used = parseInt((await env.CHAT_CACHE?.get(rkey)) ?? '0', 10)
      if (used >= 5) return 'Image limit reached (5/hour). Try again later.'
      await env.CHAT_CACHE?.put(rkey, String(used + 1), { expirationTtl: 3700 })

      const ai = env.AI as { run: (m: string, a: unknown) => Promise<{ image: string }> }
      const out = await ai.run('@cf/black-forest-labs/flux-1-schnell', { prompt, steps })
      return `![${prompt}](data:image/jpeg;base64,${out.image})`
    },
  }),
} : {}),
```

---

## Tasks

1. **Tool wiring** — `web/src/pages/api/chat.ts`
   - Add `imageSchema` next to `crawlSchema` (chat.ts:141)
   - Extend `tools` object (chat.ts:148-157) — gate `image` on `env.AI` presence (mirrors the `crawl` gate pattern on CF creds)
   - Update `SYSTEM` (chat.ts:10-14): add line *"When the user asks to draw, create, or generate an image, use the image tool."*
   - Capture `request` in scope so the rate-limit lookup has access to `cf-connecting-ip`
   - `stopWhen: stepCountIs(5)` stays unchanged

2. **Type for env** — extend the inline cast at chat.ts:91-98 to include `AI?: { run: (m: string, a: unknown) => Promise<{ image: string }> }`. No changes to `cf-env.ts` needed.

3. **No wrangler changes.** `[ai] binding = "AI"` and `CHAT_CACHE` KV are already bound (wrangler.toml:25-26, 17-19).

---

## Verify (exit scalar)

```bash
cd web && bun run dev
# in browser:
# 1. /chat → "draw a fox in a forest, watercolor"
# 2. expect: tool call → 2-4s wait → markdown image renders inline
# 3. trigger 6× rapidly → 6th returns "Image limit reached"
```

Pass = image renders within 5s on first try, no console errors, rate-limit message on 6th call.

**Out of scope for verify:** image persistence across reload. `/chat` history is in-memory in `Chat.tsx`; nothing persists today (pre-existing condition, not introduced here).

---

## Threat model row

| Threat | Defense | Accept |
| --- | --- | --- |
| Prompt injection generates abusive imagery | Workers AI has built-in content filter; prompt length capped at 500 | Filter is provider-side, not ours |
| Cost runaway (10k neurons/day cap) | 5 images/IP/hour via KV bucket | Anon shared NATs share the bucket — accept |
| SSE response bloat | One image ~100-300KB base64; one per assistant turn | No streaming partial images yet |
| Worker hits 30s CPU on flux call | flux-schnell is 2-4s; well under | n/a |

---

## Pre-existing gaps (not addressed here)

- **No `warn()` on tool failure.** Per `engine.md` Rule 1, failed tool calls should weaken the path. Neither `crawl` nor `image` does this; the chat surface isn't substrate-wired yet. Tracked separately.
- **No `emitClick`** on tool invocation — tools fire from the model, not from a button, so the rule in `ui.md` doesn't apply. Future "regenerate" / "download" buttons must emit `ui:chat:image-regen` etc.

## Follow-ups (separate cycles)

- R2 bucket `one-chat-images` + `img.one.ie` custom domain + 24h lifecycle rule
- Persistent chat history (covers all message types, not just images)
- SDXL upgrade as opt-in `model: 'sdxl'` parameter on the tool

---

## Close

Tag pheromone: `mode:lean lifecycle:construction surface:/chat tool:image`.
Emit `surface:shipped` with: tool wired (Y/N), rate-limit verified (Y/N), end-to-end latency p50 (ms), neuron usage at end of test.

---

*One tool. One model. Base64 today, R2 tomorrow. Five-second exit scalar.*
