# User UX — Strategy

> Companion to [`user-ui.md`](user-ui.md) (visual options) and [`user-guide.md`](user-guide.md) (end-user docs).
> This doc is the **why** behind the layouts.

---

## The thesis

```
Everything is a file. Chat is the only verb. Pages are renderings.
```

Three implications:

1. **No admin UI.** There is nothing to "manage" — there are only files in R2 and a chat that writes them. Settings is a file. An agent is a file. A page is a file. The skill catalogue is `ls`.
2. **The chat is the help.** No tutorials, no onboarding modals, no tooltip tours. If a user can't do something, they ask the chat and it does it (or shows them how).
3. **Every tool result is a portable artifact.** A skill is a markdown file with a URL. An A2A card is a JSON file with a URL. Everything has a deeplink, everything can be copy-pasted into Claude Code, MCP, or Agentverse.

This collapses the surface area to two intentional UIs (chat, settings) and N auto-rendered file views.

---

## Three audiences, three loops

```
                  ┌─── creates ───┐
   OWNER ─────────┤              ├─────────► R2 files (signed)
                  └─── earns ────┘                │
                                                  │
                  ┌─── reads ─────┐               ▼
   VISITOR ───────┤              ├──────► /u/<slug>/<file>
                  └─── pays ─────┘                │
                                                  │
                  ┌─── imports ───┐               ▼
   BUILDER ───────┤              ├──────► CLI / MCP / SDK / Python
                  └─── composes ─┘
```

**Owner** — created their space; logged in via passkey on a personal device.
**Visitor** — landed on a `/u/<slug>/...` URL with no passkey for that slug.
**Builder** — typically not on the site at all; reaches the substrate via `oneie skill import https://...`, `claude mcp add ...`, or fetching `agent-card.json`.

The state is: **you are an owner here, a visitor everywhere else, and a builder when you open Claude Code.** The same person plays all three roles in a single afternoon.

---

## User goals × our goals

| Audience | Their goal | Our goal | What success looks like |
|---|---|---|---|
| Visitor | Get something done / find something useful | Convert to owner OR fire a payment | `/get-yours` click, OR x402 receipt |
| Owner | Make money / share knowledge / build reputation | Activation → retention → monetization | Files written, link shared, payments received |
| Builder | Find a working skill, import it, ship | Become the registry | `oneie skill import` count, MCP install count |
| Anyone | Not lose access | Multi-device + paper recovery | Recovery codes saved, second device added |

The line that ties them all together: **every skill the owner ships becomes income from visitors and adoption from builders.** Conversion at one stage feeds the next.

---

## The friction map

Every step that asks the user for something. Each one is a leak.

```
LAND  ──►  /get-yours       ── decision: trust the brand?
      │
      ▼
  TouchID #1                 ── physical action: 1 tap
      │
      ▼
  Recovery codes shown       ── decision: save them now or skip?
      │
      ▼
  /u/<slug>/chat             ── empty: what do I ask?
      │
      ▼
  type intent                ── cognitive: what's the right phrasing?
      │
      ▼
  assistant writes file      ── trust: do I want this exact content?
      │
      ▼
  TouchID #2                 ── physical action: 2nd tap
      │
      ▼
  Live link                  ── reward: I made a thing
      │
      ▼
  share / iterate            ── ambiguity: where do I share? next step?
```

**Highest-leverage cuts:**

1. **Recovery codes interstitial → background** — show a soft banner ("Save your recovery codes ›") instead of a modal. The first save is non-blocking; we re-prompt at suspicious events (new device, payment > $10, 30-day inactivity).
2. **Empty chat → seeded conversation** — chat opens with the assistant's first message: "Hi! I noticed you just claimed `@k3xq8f9j` — want a friendlier slug?" The first task is *naming yourself*, which is concrete and low-stakes. (Slug rename is one chat tool call.)
3. **TouchID #2 fatigue → batched signing** — within a 5-minute "creative session," batch up to 10 file writes into one signature. After the session ends or any cross-domain action (payment, settings change), single-write signing returns. This is the same security model with one-tenth the taps.
4. **Phrasing cognitive load → starter chips** — five chips above the input: *Make me a page · Build an agent · Sell a skill · Connect my domain · Earn from my work*. Each chip is a real prompt that triggers a real flow.
5. **Where do I share → auto-share card** — after live link appears, show a card with: *copy URL · QR · post to X · embed* — no thinking required.

Counted differently: **a fresh visitor today crosses 9 friction points before earning their first dollar.** A v2 design should target 4.

---

## Conversion funnel

```
       VISIT      → 100%
         │
         │ ↓ value pitch fits, brand trusted
         ▼
       /get-yours  → 35-50%   (target: 60% with social proof + 1-line copy)
         │
         │ ↓ TouchID granted
         ▼
       PROVISIONED → 90% of /get-yours
         │
         │ ↓ first 60 seconds of chat
         ▼
       FIRST FILE  → 60%      (target: 85% with seeded conversation)
         │
         │ ↓ user shares the link
         ▼
       SHARED      → 25%      (target: 50% with auto-share card)
         │
         │ ↓ a visitor returns / pays
         ▼
       FIRST DOLLAR → 5%      (target: 20% with skill marketplace surface)
         │
         │ ↓ owner ships v2 skill, imports go up
         ▼
       COMPOUNDING → 1%       (target: 8% — flywheel kicks in)
```

The biggest gap today is **PROVISIONED → FIRST FILE → SHARED**. We have great provisioning and great file rendering, but the in-between is silent.

---

## Surfaces I missed

The first cut of `user-ui.md` only showed three URLs. The real surface map:

```
PUBLIC (no slug needed)
├── /                           ── home (decide who you are)
├── /get-yours                  ── provision a slug
├── /chat                       ── try the assistant before committing
├── /buy                        ── browse + pay for skills
├── /sell                       ── learn how to sell
├── /pay                        ── x402 demo / pay.one.ie surface
├── /design                     ── design-system showcase
├── /recovery-codes             ── recovery codes view (post-provision)
└── /<root-page>                ── about, pricing, etc.

OWNER (slug-scoped, requires passkey)
├── /u/<slug>/                  ── profile + file index
├── /u/<slug>/chat              ── owner chat (write tool enabled)
├── /u/<slug>/settings          ── wallet, devices, recovery, domain
└── /u/<slug>/history/<entry>   ── version history per file

PUBLIC PER SLUG (no passkey needed)
├── /u/<slug>/page/<name>       ── rendered markdown
├── /u/<slug>/agents/<name>     ── agent card + try-it-now chat
├── /u/<slug>/skills/<name>     ── skill card + price + try / import buttons
├── /u/<slug>/sitemap.xml       ── auto SEO
├── /u/<slug>/robots.txt        ── auto SEO
├── /u/<slug>/export            ── download the whole space as a tarball
└── /u/<slug>/.well-known/
    ├── agent-card.json         ── A2A v1.0 artifact
    ├── did.json                ── DID document
    ├── server.json             ── MCP registry artifact
    └── erc8004.json            ── on-chain registration payload

CUSTOM DOMAIN
└── alice.com → /u/alice/* under the hood (one Astro middleware)
```

**The four I'd promote next:**

1. `/u/<slug>/skills/<name>` — should be a beautiful product page: title, description, price, runs-this-month, copy buttons for *Claude Code*, *MCP*, *Python*, *cURL*. **This is where revenue starts.**
2. `/u/<slug>/agents/<name>` — same shape but with a try-it-now chat embedded. Visitor can talk to the agent before importing.
3. `/buy` — a marketplace surface that lists skills across all slugs, ranked by use + rating. Today this doesn't exist; without it, builders can't discover. **Hardest gap.**
4. `/u/<slug>/history/<entry>` — version diffs are useful, but the bigger UX win is a *changelog page* per file: every signed write rendered as a feed. Acts like git log for non-engineers.

---

## Surfacing CLI / SDK / MCP through chat

Today the CLI has 14 verbs and the MCP has 42 tools. Almost none are visible from the chat. Every one of them should be a tool result with a copy/share button.

```
USER: how do other people use this skill?

ASSISTANT: process-refund is callable from four places —
           (renders the card below)

┌──────────────────────────────────────────────────────────────────┐
│  process-refund · $0.05 USDC                                     │
├──────────────────────────────────────────────────────────────────┤
│  Claude Code (skill format)                                      │
│    → claude skill import https://demo.one.ie/u/alice/skills/...  │
│    [ Copy ]                                                      │
│                                                                  │
│  MCP (any client)                                                │
│    → claude mcp add alice https://demo.one.ie/u/alice/mcp        │
│    [ Copy ]                                                      │
│                                                                  │
│  Python (uAgents on Agentverse)                                  │
│    → pip install oneie && oneie run https://...                  │
│    [ Copy ]                                                      │
│                                                                  │
│  cURL (any HTTP client)                                          │
│    → curl -X POST https://.../skills/process-refund \            │
│        -H "X-PAYMENT: <x402-receipt>"                            │
│    [ Copy ]                                                      │
│                                                                  │
│  ✓ A2A card     ✓ DID     ✓ ERC-8004     ✓ Sigstore signed       │
└──────────────────────────────────────────────────────────────────┘
```

**The mapping (CLI verb → chat tool):**

| CLI verb | Chat tool | Returns |
|---|---|---|
| `agent new` | `create_agent` | PreviewCard for `agents/<name>.md` |
| `agent validate` | `validate` | rubric scorecard |
| `agent compile --target <t>` | `compile` | downloadable artifact link |
| `agent serve` | `serve` | local serve hint or hosted URL |
| `agent publish` | `publish` | registry submission receipt |
| `agent sign` | `sign` | sigstore bundle |
| `agent verify <url>` | `verify` | trust badge |
| `agent eval` | `eval` | EvalCard (already exists) |
| `agent diff a b` | `diff` | side-by-side diff card |
| `skill emit` | `emit` | "download as Claude Code skill" link |
| `skill publish` | `publish_skill` | registry receipt + share card |
| `skill refresh` | `refresh` | "imported skills updated" toast |
| `skill import <url>` | `import` | import card with trust prompt |
| `auth login` | (browser only — passkey is the auth) | — |

**The MCP tools** are a superset of the CLI; same chat-tool wrapping applies.

The key insight: **the chat tool execute() function is a thin wrapper around the CLI verb.** Same logic, different render. This means the chat doesn't duplicate functionality — it surfaces it.

---

## Conversation improvements

Six concrete changes to the chat surface that compound:

### 1. Suggested next actions after every response

```
─── Just wrote skills/process-refund.md ──────

┌──────────────────────────────────────────────┐
│  Try saying:                                 │
│   ✦ "evaluate this skill with 3 test cases"  │
│   ✦ "list it on /buy for $0.05"              │
│   ✦ "make an agent that uses it"             │
└──────────────────────────────────────────────┘
```

The model emits up to 3 follow-ups per turn as a structured tool result. Click → submits as the next user message. Removes the "what now?" leak from the friction map.

### 2. Inline skill catalogue at chat open

```
Hi @alice — your skills:
  ⚡ process-refund · $0.05 · 14 calls last week
  ⚡ csv-analyzer · free · 3 calls
  ⚡ summarise · $0.01 · 0 calls (try evaluating it?)

What do you want to build today?
```

Counts and dollar amounts make the substrate feel alive. They also surface neglected work without nagging.

### 3. Multi-modal input

The PromptInput should accept:
- **Text** (default)
- **Voice** (Whisper → text; partially exists)
- **Drag/drop file** (parse + summarise as the prompt)
- **Paste URL** (fetch + use as context)
- **Paste image** (vision for screenshots, diagrams)

Each non-text input becomes a chat message with the file as an attachment. The file is also stored in `<slug>/_attachments/<sha>.<ext>` so it can be referenced later.

### 4. Tool results render as cards, not text

Already partially done (PreviewCard, EvalCard, PaymentCard). Extend to: ImportCard, PublishCard, VerifyCard, DiffCard, ShareCard. Every tool with a result gets a card.

**Rule:** if a tool returns text, it's a bug. Tools return structured data; the renderer picks the right card.

### 5. Co-presence indicators

When the model is working:

```
✦ thinking…              0.3s
⚡ writing skill body…    1.2s
✓ running 3 evals…       8.4s   ← live timer
```

Live ChainOfThought already exists. The polish: time per step, total time at end, and a "tokens used: 3,420 · cost: $0.012" footer for power users.

### 6. The "ambient" mode

Some flows shouldn't break the conversation. Examples:

- **Auto-eval after publishing** — chat says "shipping…" → in the background runs evals → posts back "✓ pass-rate 0.91 · 23 imports"
- **Auto-deploy custom domain** — verifies DNS → posts back when ready
- **Auto-watch for x402 payments** — posts back when first dollar lands

Make these ambient streams visible as a strip at the top of the chat (or a notification bell) so the user can see them happening without losing focus.

---

## Pages I'd add or radically rework

Beyond the surfaces I missed, three new pages would unlock the most:

### `/buy` — marketplace

A grid of skills across all slugs, sortable by *new · popular · earning · cheap*. Each card shows price, owner, last 7d calls, rating, and a one-click *Try it* (pay-as-you-go) or *Import* (paste-into-Claude-Code) button.

This is the discovery layer. Without it, every owner is islanded. **Highest-leverage missing surface.**

### `/u/<slug>/inbox` — payments + imports + comments

Owner notifications in one place:
- Payments received (visitor x402 receipts)
- Skills imported (third-party Claude Code installs)
- Comments / DMs on shared pages
- Eval results from background runs

Not a separate UI to build — it's a render of the existing `notifications` D1 table that already exists.

### `/dashboard` — for power owners

Once an owner has 5+ files and 50+ calls, the bento alone gets cramped. A `/dashboard` route renders charts: revenue per day, top skills, import sources, eval pass-rate trends. **Optional second layer**, only for owners that hit the threshold.

---

## What "easy" really means

Easy is not "fewer features." Easy is:

1. **Defaults that remove decisions.** Random slug today; rename later. Free price tier today; charge later. Single device today; add more later.
2. **Two paths max at any branch.** *Try the chat* OR *get your space*. *Page* OR *skill*. *Free* OR *paid*. More than two = freeze.
3. **The chat is the help.** No docs link. No support form. The chat answers "how do I X?" by *doing X*.
4. **Show, don't ask.** Empty states have a sample, not instructions. Errors show a fix, not a stack trace.
5. **One physical action per atomic intent.** Provision = one tap. Each batch of writes = one tap. Each payment = one tap.

The current build hits 1 and 4 well. It misses on 3 (chat doesn't surface CLI), 2 (chat empty state has 5 starters not 2), and 5 (TouchID twice).

---

## What we're optimising for

Not pageviews. Not signups. Not even revenue, directly.

```
Pheromone strength on the path:  visitor → owner → skill → import → revenue
```

Every feature should be evaluated by *does it strengthen this path?* If yes, ship. If no, defer. The friction cuts above strengthen the early segments. The hidden-functionality cards strengthen the late segments. The marketplace is the missing middle.

When pheromone compounds, the substrate flywheel turns: more skills → more imports → more revenue → more owners → more skills. That's the only number that matters.

---

## Recommendation, sequenced

1. **This week:** seeded chat empty state + soft recovery banner + auto-share card (kills 3 friction points; 2-day build)
2. **Next:** suggested-next-actions tool + inline skill catalogue (improves conversation, 3-day build)
3. **Then:** the share/import card on every skill page + `/buy` marketplace v0 (unlocks builder loop, 1-week build)
4. **Then:** tool-result cards for every CLI verb + ambient mode (surfaces hidden functionality, 1-week build)
5. **Then:** `/u/<slug>/inbox` + payment receipts + import receipts (closes the revenue loop, 3-day build)

Total: ~3 weeks of work, in order. Each step compounds the next. None of them require new infrastructure — every piece is a render of existing R2 / D1 / signal data.

---

*Everything is a file. Chat is the only verb. Pages are renderings. Defaults remove decisions. The chat is the help. Two paths max. Pheromone is the metric.*
