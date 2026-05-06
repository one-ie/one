---
title: donal.md — OO agency chatbot embed
type: spec
version: 1.0.0
status: CONSTRUCTION
updated: 2026-05-06
classifier:
  spec_locked: yes
  variance_known: yes
  exit_scalar: "chatbot.onlineoptimisers.ai live, embed on two client sites, takes a Quick AI Audit payment in chat"
  files_known: yes
  mode: lean
  lifecycle: construction
---

# donal.md — OO agency chatbot embed

**Principle:** every Donal client is already a ONE group. Multi-tenancy is not a feature to build — it is the architecture. The embed surface, three tools, and a CF Pages project are the only gap between what exists and OO going live.

Inherits from the cluster:
- **Two roots, one biometric, paper resurrects** (`mac.md`) — passkey gates every owner write; visitors pay without credentials
- **Threat model is a table** (`mac.md`) — this doc has one per surface
- **Four patterns** (`agents.md`) — the chatbot is co-sign pattern: agent proposes, human confirms before any money moves
- **Chat is the interface** (`chat.md`) — the embed is the chat surface deployed to third-party domains

---

## The thesis

> A Donal client is a ONE group. A ONE group is a `/u/<slug>/` sandbox. A sandbox has agents, skills, site identity, and a pheromone trail. The embed script loads that sandbox into any client site. **Multi-tenancy is already shipped. The embed is the last metre.**

Proof of the mapping:

| Donal's config key | ONE ontology | Ships as | Status |
|---|---|---|---|
| `tenant` | **Group** — R2 prefix `<slug>/`, D1 `owners` row | `/u/lankford-roofing/` | ✅ shipped |
| `brand.primary + font + logo` | Group identity | `site.md` 6 tokens | ✅ shipped C7 |
| `agents: [sales, support]` | **Actors** — agent markdown files | `agents/sales.md`, `agents/support.md` | ✅ shipped |
| `knowledge.source` | Actor body (system prompt) | Body of `agents/sales.md` | ✅ shipped |
| `skills` | **Things** — skill files with price + schema | `skills/qualify-lead.md` etc | ✅ shipped |
| `stripe.products` | Thing price field | `price:` in skill frontmatter | ✅ shipped |
| `calendar.id` | Tool param in `createBooking` | `cal_id:` in skill frontmatter | ❌ tool needed |
| `auth.required: false` | Visitors never need passkey | Default — passkey gates owner writes only | ✅ structural |
| Payment events | **Events** — signals with `amount` | D1 + pheromone path | ✅ partial (x402) |
| Lead conversion patterns | **Learning** — hypotheses per group | Pheromone strength on paths | ✅ structural |

The pheromone separation is free: Lankford's group learns what converts for roofers; OO's group learns what converts for agency prospects. Isolated by slug, shared substrate.

---

## Phase 1 — MVP (the four things to build)

### 1. Embed script (`embed.js`)

One snippet drops the chatbot into any client site:

```html
<script
  src="https://chatbot.onlineoptimisers.ai/v1/embed.js"
  data-tenant="lankford-roofing"
  data-agent="sales"
  data-position="bottom-right"
></script>
```

`embed.js` does exactly one thing: resolve `data-tenant` → `/u/<slug>/chat?agent=${agent}` and mount the existing `<Chat>` React component as a web component inside a shadow DOM. No new chat logic. No new API. The shadow DOM isolates tenant CSS from the client site.

**Resolution:** `data-tenant` maps to `slug` via a KV lookup at `chatbot.onlineoptimisers.ai/v1/tenant/<name>` → `{ slug: "lankford-roofing-1742" }`. The tenant registry is one KV namespace with name→slug entries. Donal registers tenants in `/settings` (owner-gated). Adding tenant 11 is: provision slug + write tenant name to KV + add `<script>` to client site.

**Attributes:**

| Attribute | Default | Effect |
|---|---|---|
| `data-tenant` | required | KV lookup → slug |
| `data-agent` | `sales` | `?agent=` param on chat URL |
| `data-position` | `bottom-right` | CSS position of the widget trigger |
| `data-trigger` | `widget` | `widget` (button) or `inline` (embedded panel) |
| `data-theme` | `auto` | `light`, `dark`, or `auto` (inherits client site) |

The Chat component already renders in dark and light modes (inherits `site.md` 6 tokens). The embed passes the host page's `prefers-color-scheme` when `data-theme=auto`.

**Bundle size target:** < 50 KB gzipped. The Chat component already passes the lazy-import rules (`one-ie/one/.claude/rules/astro.md` §Performance) — AttachmentsPreview, SpeechInput, and PayPanel are all lazy behind `Suspense`. The embed bundle reuses the same lazy pattern.

### 2. Three tools

Tools are TypeScript files in `web/src/lib/tools/` — bundled at Worker build, registered in `chat.ts` alongside existing tools (`write`, `eval`, `skill`, `payment`, `compile`). All three follow the co-sign pattern: agent proposes → user sees confirmation card → action executes.

#### `captureLead`

```typescript
captureLead({
  name: string,
  email: string,
  phone?: string,
  notes?: string,          // conversation summary
  tenant: string,          // slug — for webhook routing
  source: string,          // e.g. "lankford-roofing/chat?agent=sales"
})
→ { captured: true, leadId: string }
```

Execution: POST to `env.LEAD_WEBHOOK_URL` (set per-tenant in `site.md` as `webhook.leads: <url>`) with HMAC signature. OO receives leads in a Google Sheet via n8n. The webhook receives:

```json
{
  "tenant": "lankford-roofing",
  "leadId": "lead_<uuid>",
  "name": "...", "email": "...", "phone": "...",
  "notes": "...",
  "source": "...",
  "ts": 1746547200000
}
```

n8n webhook → Google Sheet "OO Chatbot Leads" (one row per lead, columns: timestamp, tenant, name, email, phone, notes, source). Tomas notified via n8n Slack/email step.

No auto-send email from the bot. The webhook fires; humans decide follow-up.

#### `takePayment`

Stripe Checkout session, not x402 (x402 is crypto; this is fiat card for clients).

```typescript
takePayment({
  tenant: string,
  priceId: string,         // Stripe price ID from skill frontmatter
  description: string,     // shown in Checkout
  customerEmail?: string,  // pre-fill
  metadata?: Record<string, string>,  // leadId, bookingId, etc.
})
→ { checkoutUrl: string, sessionId: string }
```

Returns a Stripe Checkout URL as a clickable link in chat. The agent does NOT complete the payment — it surfaces the link with price confirmation: *"Quick AI Audit — $47. [Pay now →]"*. Visitor clicks, completes in Stripe's hosted page, returns to site.

Stripe account: single OO account (`STRIPE_SECRET_KEY` in wrangler secrets). Per-tenant price IDs live in the skill frontmatter:

```yaml
# skills/quick-ai-audit.md
---
name: quick-ai-audit
title: Quick AI Audit
price: 47
stripe_price_id: price_xxx
cal_id: onlineoptimisers/quick-audit
description: Use when a visitor wants a quick AI audit for their website.
---

You are about to receive a Quick AI Audit for your website...
```

The skill body is the post-payment flow instruction. The `stripe_price_id` and `cal_id` fields are read by the tools at invocation — no config files, no separate registry.

Webhook at `/api/pay/webhook.ts` (already exists) handles `checkout.session.completed` → fires `captureLead` with payment metadata, marks the conversation in D1.

#### `createBooking`

Cal.com v2 API. The simplest path — no custom PMS adapters needed for v1.

```typescript
createBooking({
  calId: string,           // from skill frontmatter e.g. "lankford-roofing/inspection"
  name: string,
  email: string,
  date: string,            // ISO 8601 — from Cal.com availability query
  notes?: string,
})
→ { bookingId: string, confirmed: boolean, calLink: string }
```

Two-step flow: 
1. Agent calls `getAvailability({ calId, dateRange })` → returns next 3 open slots as human-readable options in chat
2. Visitor picks a slot → agent calls `createBooking` with confirmation card first: *"Book: Wednesday 14 May, 10am with Lankford Roofing. [Confirm] [Change]"*
3. Visitor clicks Confirm → booking lands in Cal.com, confirmation email from Cal.com (not us — OO Rule 12: no auto-send emails from the bot).

Cal.com API key per tenant: stored encrypted in `owners.agentverse_key_enc` field (same slot used for Agentverse; in v1 we alias it for Cal.com or add `cal_key_enc` column). Set once via `/u/<slug>/settings`.

### 3. Per-tenant provisioning flow

Adding a new Donal client takes < 10 minutes:

```
1. Tony visits one.ie → "Get your site" → passkey → lands in /u/<new-slug>/chat
2. Chat: "Set up Lankford Roofing"
   → model calls write({ file: 'site', content: <site.md with their brand> })
   → Face ID → live
3. Chat: "Add a sales agent that books roofing inspections"
   → model calls write({ file: 'agents/sales', content: <agent.md> })
   → Face ID → live
4. Chat: "Add a take-deposit skill for emergency callouts"
   → model calls write({ file: 'skills/emergency-callout', content: <skill.md> })
   → Face ID → live
5. /u/<slug>/settings → Connect domain → CNAME lankfordroofingconstruction.com → one.ie
6. chatbot.onlineoptimisers.ai KV: set "lankford-roofing" → "<slug>"
7. Add <script data-tenant="lankford-roofing"> to client site
```

Seven steps. Zero config files. Zero deploys. The chat IS the provisioning tool.

### 4. CF Pages project — `chatbot.onlineoptimisers.ai`

A second `wrangler.toml` in `web/` (or a new `chatbot/` package) bound to a separate CF Pages project. Points to the same Worker code but with:

```toml
name = "oo-chatbot-embed"

[vars]
EMBED_MODE = "true"       # serves /v1/embed.js + proxies chat to demo.one.ie

[[kv_namespaces]]
binding = "TENANT_REGISTRY"
id = "<kv-id>"            # name → slug map

[[env.production.routes]]
pattern = "chatbot.onlineoptimisers.ai"
custom_domain = true
```

The Worker in `EMBED_MODE`:
- `GET /v1/embed.js` → serves the embed bundle (built by Vite, deployed as a static asset)
- `GET /v1/tenant/:name` → KV lookup → `{ slug }` (used by embed.js client-side)
- All other routes proxy to the slug's Worker (or serve the full Astro app)

This means `chatbot.onlineoptimisers.ai` itself can also serve as the chatbot UI (for direct link sharing) — not just the embed origin.

---

## Phase 2 — Agent message bus

Donal's `head_seo` and peer agents are already `actor` entities in the ONE ontology. The message bus is the substrate. The question is whether NanoClaw (`claw/`) exposes the multi-agent surface.

**Answer:** Yes — `claw/` is `ToolLoopAgent` on CF Workers + D1/KV + substrate middleware. It already routes signals between agents (`substrateMiddleware` wires pheromone). What's needed is:

1. Register Donal's markdown personas (`CEO`, `CMO`, `head_seo`, etc.) as actors in ONE — each becomes a unit via `SubstrateClient.syncAgent()`
2. Expose a group chat surface where Donal can message `@head_seo` and see it delegate to sub-agents — this is `/groups` on `one.ie` (already in the spec at `website.md` §groups), scoped to Donal's org group
3. Dashboard tie-in: NanoClaw status feeds the existing `oo-portal.pages.dev` via a webhook or iframe from `/u/<slug>/settings → Analytics` — same notification infrastructure already built

The shortest path: sync the 20 OO markdown agents via `npx oneie agent sync agents/` against OO's slug → they appear as actors in OO's group → Donal can `@mention` them in `/u/<oo-slug>/chat`.

**Multi-agent chat surface:** built in Phase 1 as a side effect — `/u/<slug>/chat?agent=head_seo` routes to that persona; group chat across multiple agents is the next cycle.

---

## Phase 3 — Autonomous delivery (post May 30)

The white-label SEO team replacement. By May 30 the chatbot is live and generating leads. Phase 3 wires:

- `head_seo` schedules recurring site audits via `intervals:` in its agent.md
- `head_cro` monitors conversion paths via pheromone trail analysis
- `head_analytics` generates weekly reports as signals to Donal's inbox
- The L5 evolution loop (`one.ie/CLAUDE.md` §7 loops) rewrites underperforming agent prompts automatically

None of this needs new infrastructure. It's `agent.md` frontmatter and the substrate loops already running. Phase 3 is configuration, not code.

---

## The embed architecture (detailed)

```
Client site (lankfordroofingconstruction.com)
  <script data-tenant="lankford-roofing" src="chatbot.onlineoptimisers.ai/v1/embed.js">

  embed.js loads:
    1. fetch /v1/tenant/lankford-roofing → { slug: "lankford-1742" }
    2. mount <one-chat> web component (shadow DOM)
    3. iframe src = chatbot.onlineoptimisers.ai/u/lankford-1742/chat?agent=sales

  Inside the iframe (same CF Worker, slug-scoped):
    - site.md → Lankford brand tokens applied
    - agents/sales.md → Lankford Sales persona loaded
    - skills/ → qualify-lead, take-deposit available
    - tools: captureLead, takePayment, createBooking registered
```

The iframe boundary provides:
- Origin isolation (no cross-site script access)
- Cookie scoping (Stripe redirect lands correctly)
- CSP compliance (client site CSP only needs to allowlist the iframe src)

No shadow DOM CSS leakage. No shared JS context. The embed is a sealed surface.

**Trigger modes:**

| `data-trigger` | Renders as | When to use |
|---|---|---|
| `widget` | Floating button, bottom-right, opens on click | Default — all client sites |
| `inline` | Fixed panel inside a `<div data-one-embed>` target | When client wants chat embedded in a section |

---

## Hard rules (non-negotiable)

From Donal's spec. These are structural, not policy:

1. **No money-moving action without in-chat confirmation.** `takePayment` and `createBooking` always return a `pending-action` card first. The visitor taps Confirm before the Stripe session or Cal.com booking fires. This is the co-sign pattern from `agents.md`.
2. **No auto-sent emails.** `captureLead` fires a webhook to n8n. Tomas or the n8n flow decides follow-up. The bot drafts; humans send.
3. **No PHI without BAA.** Dentist/HIPAA tenants are Phase 2+ and require auth-gated personas. Not in MVP.
4. **No cross-tenant data.** Each slug's R2 prefix is isolated. `captureLead` only fires the webhook configured in that slug's `site.md`. No shared lead tables.
5. **Stripe routing is single OO account + metadata.** `metadata.tenant` on every PaymentIntent and Checkout Session. Per-tenant Stripe accounts are Phase 2.

---

## Threat model

| Surface | Defends against | Accepts |
|---|---|---|
| Shadow DOM iframe isolation | Client-site JS reading chat state; CSS injection | Browser zero-day on iframe boundary |
| HMAC-signed webhook payload | Forged lead submissions | Webhook URL leaked → spoofed leads (mitigated by HMAC) |
| Stripe Checkout hosted page | Card data in chat logs or our servers | Stripe account compromise |
| Cal.com booking confirmation card | Agent auto-booking without visitor intent | Visitor confirms a slot they didn't mean |
| Slug-isolated R2 + per-tenant webhook URL | Lead data crossing tenant boundaries | Misconfigured `site.md` pointing to wrong webhook |
| x402 for crypto-native skill payments | Stripe for fiat — separate path, no collision | Both can be active on the same skill |

---

## Files and line budgets

All paths relative to `one-ie/one/`. A budget exceeded by >30% is a smell.

| File | Purpose | Budget |
|---|---|---|
| `web/src/lib/tools/capture-lead.ts` | `captureLead` tool — webhook POST + HMAC | 40 |
| `web/src/lib/tools/take-payment.ts` | `takePayment` tool — Stripe Checkout session | 50 |
| `web/src/lib/tools/create-booking.ts` | `createBooking` tool — Cal.com v2 API + availability query | 70 |
| `web/src/pages/api/chat.ts` | Register 3 new tools; read `cal_id` + `stripe_price_id` from skill frontmatter | +30 |
| `web/src/pages/api/pay/webhook.ts` | Handle `checkout.session.completed` → fire captureLead | +20 |
| `web/src/components/chat/ConfirmCard.tsx` | Confirm card for takePayment + createBooking (extends PreviewCard pattern) | 40 |
| `web/src/embed/embed.ts` | Entry point — KV lookup, mount `<one-chat>` web component, iframe | 60 |
| `web/src/embed/OneChat.ts` | Web component class, shadow DOM, widget trigger, position CSS | 80 |
| `web/embed.vite.config.ts` | Vite config for the embed bundle — IIFE, < 50 KB target | 20 |
| `web/wrangler.chatbot.toml` | `oo-chatbot-embed` worker — EMBED_MODE, TENANT_REGISTRY KV, chatbot.onlineoptimisers.ai route | 30 |
| `web/migrations/0005_embed.sql` | `tenant_registry(name PK, slug, created_at)` — also covered by KV; D1 for audit | 6 |
| **Total new code** | | **~446** |

Existing files touched but not bloated:
- `web/src/pages/api/chat.ts` — tool registration only (+30 lines)
- `web/src/pages/api/pay/webhook.ts` — checkout.session handler (+20 lines)
- `web/src/lib/site.ts` — read `webhook.leads` field from site.md (+10 lines)
- `web/wrangler.toml` — no changes; new `wrangler.chatbot.toml` is separate

---

## Tenant config shape (what Donal writes via chat)

No JSON config files. The "config" is three markdown files written via chat, each under the tenant's slug:

**`site.md`** — brand + identity + webhook

```yaml
---
name: Lankford Roofing & Construction
tagline: Fast quotes. Reliable crews. Fixed prices.
logo: media/lankford-logo.svg
font: Inter
theme:
  primary: "#0E7490"
  secondary: "#475569"
  tertiary: "#F59E0B"
  background: "#0f172a"
  foreground: "#1e293b"
  font: "#f1f5f9"
webhook:
  leads: https://n8n.onlineoptimisers.ai/webhook/oo-chatbot-leads
analytics: true
---
```

**`agents/sales.md`** — the Sales persona

```yaml
---
agentmd: "0.1"
name: sales
title: Lankford Sales
model: anthropic/claude-haiku-4-5
summary: Get a fast quote for your move or roofing job.
starters:
  - Get a moving quote
  - Book a roofing inspection
  - How much does it cost?
skills: [mover-quote, take-deposit]
tools: [captureLead, takePayment, createBooking]
sensitivity: 0
---

You are the sales agent for Lankford Roofing & Construction...
```

**`skills/mover-quote.md`** — a callable action

```yaml
---
name: mover-quote
title: Moving Quote
price: 0
stripe_price_id: price_lankford_deposit_50
cal_id: lankford-roofing/moving-survey
description: Use when a visitor asks about moving costs, quotes, or scheduling a survey.
inputSchema:
  type: object
  required: [origin, destination, date]
  properties:
    origin: { type: string }
    destination: { type: string }
    date: { type: string }
    bedrooms: { type: number }
---

Collect origin, destination, date, and number of bedrooms. Give a rough estimate...
```

The `stripe_price_id` and `cal_id` fields are the only OO-specific additions to the standard `agent-spec.md` schema. They are read by `takePayment` and `createBooking` at tool invocation. No separate config layer.

---

## Acceptance tests (Phase 1 done = all pass)

| # | Test | Pass condition |
|---|---|---|
| T1 | `chatbot.onlineoptimisers.ai` responds | `curl -I chatbot.onlineoptimisers.ai/v1/embed.js` → 200 |
| T2 | Embed resolves tenant | `fetch /v1/tenant/lankford-roofing` → `{ slug: "lankford-1742" }` |
| T3 | Embed mounts on test page | `<script data-tenant="lankford-roofing">` → widget appears, chat opens |
| T4 | OO tenant sells Quick AI Audit | "I want a quick AI audit for acme.com" → email capture → Stripe Checkout URL → payment → webhook fires → Google Sheet row appears |
| T5 | Lankford tenant captures lead | "Moving 2-bed from Dublin to Cork on 20 May" → confirm card → `captureLead` fires → Google Sheet row appears |
| T6 | Booking confirmation gate | createBooking proposes slot → user must click Confirm → booking appears in Cal.com |
| T7 | No cross-tenant data | Lankford lead webhook fires to Lankford's `site.md` URL, not OO's |
| T8 | No auto-email | Stripe checkout.session.completed → webhook fires → no email sent by bot |

---

## Build classifier

| Prior | Score |
|---|---|
| Spec locked | Yes — ontology mapping + 3 tool contracts above |
| Variance known | Yes — iframe embed + Cal.com v2 API + Stripe Checkout are all known shapes |
| Exit scalar | Yes — T1–T8 above are the gate |
| Files known | Yes — 12 files, 446 lines |

**4/4 → `mode: lean`.** One cycle. W1 recon (existing chat.ts + pay routes) → W2 decide (confirm tool contracts) → W3 edit (3 tools + embed) → W4 verify (T1–T8 + bun run verify + Lighthouse on embed page ≥ 95).

---

## Cross-references

| Topic | Where |
|---|---|
| Chat surface spec | [`../../chat.md`](../../chat.md) |
| Site identity + 6 tokens | [`modify.md`](modify.md) §Real sites |
| Agent + skill schema | [`agent-spec.md`](agent-spec.md) |
| ONE ontology (6 dimensions) | [`one-ontology.md`](one-ontology.md) |
| x402 (crypto payments, not this) | [`../../x402.md`](../../x402.md) |
| Existing Stripe integration | [`../web/src/pages/api/pay/create-intent.ts`](../web/src/pages/api/pay/create-intent.ts) |
| Embed lazy-import rules | [`../.claude/rules/astro.md`](../.claude/rules/astro.md) §Performance |
| Co-sign pattern | [`../../agents.md`](../../agents.md) §co-sign |
| Design tokens | [`../.claude/rules/design.md`](../.claude/rules/design.md) |
| NanoClaw (Phase 2 runtime) | [`../claw/README.md`](../claw/README.md) |
| Prior chatbot spec (sections 1-2 only) | `onlineoptimisers/agency-operator/docs/tony-chatbot-integration-plan.md` |

---

*One Worker. Many tenants. Three tools. One embed. The substrate already knows which group it's talking to.*
