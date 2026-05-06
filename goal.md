# goal.md — what we ship today

**Status:** the codebase has ~230 files across `web/` and most of them work. The problem isn't capability. The problem is that "what is this product" doesn't fit on one screen, so visitors bounce, contributors guess, and we keep building.

This file fixes that. One goal. Three audiences. One launch surface. Everything else defers.

---

## The one goal

> **Anyone gets their own AI agent at `one.ie/u/{name}` in under 60 seconds, no signup, no wallet prompt, no card.**

That's it. The agent has a page, a chat, and a public URL the owner can share. Saving it is a Touch ID tap *later*, when they care. Selling things through it is *later*. Custom domains, payments, voice, evals — all *later*.

If a feature doesn't make that 60-second arrival shorter, smoother, or more shareable, it isn't launch.

---

## Goals per audience

### For us (the builders)

- **Ship one wedge, learn from real arrivals.** Stop adding surfaces. Cut routes from 20 → 5. Every PR until launch either deletes code or makes the wedge faster.
- **One number to optimize:** time from `one.ie` first paint → public `/u/{name}` link copied to clipboard. Target: ≤ 60s p50.
- **One rule:** if you can't explain why a feature shortens that number, it's hidden behind a feature flag or removed.

### For our users (people who arrive at one.ie)

- **They get a thing they own, in a minute, without thinking about crypto, accounts, or AI.** They type a name, the agent appears, they chat with it, they share the link. The wallet, the passkey, the recovery words — all silent until they have something worth protecting.
- **Their first 60 seconds are the demo.** No tour, no onboarding modal, no "sign up to continue."

### For their users (people who land on `/u/{name}`)

- **They can chat with that person's agent immediately, no auth, no install, no friction.** The page paints, the chat works, they leave smarter or with what they came for.
- **Sharing is the distribution.** A `/u/{name}` link in a tweet, DM, or QR code IS the marketing channel. Each chat is an ad for the next visitor making their own.

---

## The launch surface — 5 routes only

| Route | Why it ships |
| --- | --- |
| `/` | Hero + one CTA: "claim your name." Nothing else. |
| `/get-yours` | The 60-second flow: type a name → passkey (silent if possible) → done. |
| `/u/[slug]` | The owner's public page. Markdown profile + chat embed. |
| `/u/[slug]/chat` | Full chat. Streaming. Works for visitors and owner. |
| `/api/chat` + `/api/provision` + `/api/commit` | The three endpoints those four pages need. |

Everything in `features.md` outside those routes is **deferred**, not deleted — but hidden from the navigation, not linked from `/`, and not part of the launch story.

---

## What defers (the "not today" list)

These are real, mostly working, and will land later. None of them should be in the launch demo:

- **Payments** — Stripe checkout, x402 receipts, PayPanel, pricing page, crypto QR
- **Agent canvas / ReactFlow** — node graphs are advanced; wedge users don't need them
- **Eval surfaces** — skill benchmarking is a power-user tool, hide from `/`
- **Voice & TTS** — `speech-input`, `voice-menu`, audio player; not on the critical path
- **Motion showcase + design page** — internal tools, gate behind `/_dev/*` or remove from menu
- **Discord / Telegram webhooks** — channel ingress is a v2 story
- **Custom domains** — `domain.ts` is built; defer the marketing of it
- **Recovery codes UI** — generate silently; only show during the *Save* prompt, not now
- **Multi-device, Google linking, BIP39 restore** — all in `simple.md` lifecycle states 3-6, all defer until state 1+2 (arrive + save) is rock solid
- **Pro/Team pricing tiers** — pricing component stays unlinked until we know what to charge for
- **MCP / SDK / CLI surfaces** — those live in `one-ie/one/` for developers; the launch is for humans

Rule: a deferred feature stays in the codebase, off the homepage, off the sidebar, and out of the demo. Re-introduce it only when the wedge is proven.

---

## How we keep it simple (the operating rules)

1. **One CTA on `/`.** "Claim your name." No "explore," "learn more," "see how it works."
2. **No modals before first paint.** No cookie banner, no "install this PWA," no email capture.
3. **No Touch ID until they ask.** Per `simple.md` state 1: ephemeral wallet exists silently. Save is a *prompt after value*, not a gate at the door.
4. **Every page on the launch surface MUST hit ≥95 Lighthouse Performance + Accessibility in dark mode.** This is already enforced for `/chat`; extend to the other four.
5. **Every onClick on the launch surface emits `emitClick('ui:<surface>:<action>')`** — so we measure where users actually go, not where we think they go.
6. **No new top-level routes between now and launch.** If a contributor needs one, they cut an existing one first.

---

## The exit criteria — what "launched" means

Three numbers, all measurable:

- **p50 arrival time ≤ 60s** — `one.ie` first paint to `/u/{name}` link in clipboard
- **p50 chat first-token ≤ 1.5s** — visitor lands on `/u/{name}/chat`, types, sees streaming
- **0 failed provisions in a week of real traffic** — `/api/provision` either succeeds or surfaces a clear retry, no silent failures

When those three hold for a week, we ship the *next* thing on the deferred list — one at a time, measured against the same wedge.

---

## What this doc replaces

`features.md` answers *what exists*. `goal.md` answers *what matters*. When they conflict, `goal.md` wins until launch — features without a goal are debt, not assets.

After launch, this doc gets rewritten with the next wedge. One goal at a time, forever.

---

*One goal. Three audiences. Five routes. One number. Everything else, later.*
