# ui.md — Surfaces, lifecycle, primitives

**The product is chat.** Everything else is *inspection and refinement* of
what chat just built. The sidebar surfaces exist so you can see, tune,
and ship the thing chat made — not so you can build it from scratch.

```
chat builds it          ←  primary path, 80% of users never leave it
sidebar refines it      ←  inspect, tune, brand, ship
```

If a user has to leave `/chat` to make the product work, we failed.

---

## The 4 primitives (the whole UI is these)

```
┌─ Card ──────────────┐  ┌─ Grid ──────────────┐  ┌─ Form ──────────────┐  ┌─ Chat ──────────────┐
│ title       badge   │  │ ▦  ▦  ▦  ▦         │  │ Label               │  │ msg msg msg         │
│ ┌─────────────────┐ │  │ ▦  ▦  ▦  ▦         │  │ ┌─────────────────┐ │  │ ┌─────────────────┐ │
│ │ body            │ │  │ ▦  ▦  ▦  ▦         │  │ │ value           │ │  │ │ assistant reply │ │
│ └─────────────────┘ │  │                     │  │ └─────────────────┘ │  │ └─────────────────┘ │
│ meta      [action]  │  │ [+ new]             │  │ [save]   [cancel]   │  │ > _           [▶]  │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘
   one thing detailed     many things scannable     change one thing        steer the agent
```

**Composition rule:** every page = `Header + (Card | Grid | Form | Chat) + omnipresent Chat dock`.

The chat dock (bottom-right, collapsible) is on *every* surface. You can
always say "rename this agent" or "make the brand greener" without
navigating. **Chat is the universal command line.** This is the friction
move — surfaces become optional.

---

## The lifecycle (developer path, arrival → revenue)

The shortest possible path from "never heard of ONE" to "earning":

```
   arrive               first agent           configure                deploy           earn
─────────────       ──────────────────       ──────────────       ──────────────       ──────
   /chat       →    /chat (auto-builds)  →    /skills /tools  →    /chat (deploy) →   /payments
   "I want a        ⌬ "Done. Open it?"        ☑ slack ☑ stripe      "live at         + $5.00
    refund bot"                                                      acme.one.ie"     + $5.00
─────────────       ──────────────────       ──────────────       ──────────────       ──────
    20 sec              30 sec                  60 sec                10 sec          ongoing

                      sidebar visited only when needed ─────────────────────►
```

**Most surfaces are passive most of the time.** /agents fills as agents
get built. /skills shows what each agent has. /payments fills as money
flows. /design has a sensible default. /settings is empty by default.

**No surface ever requires the user to start from blank.** Defaults are
chosen *so good that 90% of users never edit them*. Editing is for the
remaining 10% who outgrow defaults.

---

## The 10 elegance moves (the whole product is these)

Every gap closes via one or two of these. Naming them up front makes the
rest of the doc short — each surface just *cites* the move.

| # | Move | What dissolves |
| --- | --- | --- |
| **M1** | **Passkey is the save button.** Auth is triggered by *value created*, never by intent. Anonymous chat works; passkey only appears when there's something to lose. | sign-up wall, onboarding flow, "create an account" friction |
| **M2** | **One route, viewer mask.** `creator | developer | end_user` is a property of identity, not a setting. Same DOM, three masks. | `/admin` vs `/public` split, role wizards |
| **M3** | **Drawer over route.** Detail = drawer over the grid. Tabs inside the drawer = lenses (definition / chats / trace / revenue / generations / connect). | back-button hops, breadcrumbs, detail pages, deep-link nesting |
| **M4** | **Chat dock = `/chat` route, minimized.** Same React island, same substrate session — different layout. The dock carries surface context as a system signal. | "command palette" + "chat" + "search" all collapse to one thing |
| **M5** | **Markdown frontmatter is the config surface.** Pricing, embed config, tools, skills — all live in the agent's `.md` file. Chat edits it. | settings forms per agent, pricing wizards, embed configurators |
| **M6** | **Two-zone grid: yours / available.** Marketplace dissolves into the surface (`/skills`, `/tools`, `/agents`). | a `/marketplace` route, discovery loops |
| **M7** | **Empty state is a card with a chat input.** The affordance and the explanation are the same shape. | "you have no X yet — click here" tours |
| **M8** | **Substrate trace is the only data source.** Logs, notifications, eval, revenue — all are *lenses* on one stream of `mark`/`warn`/`signal`. | log infra, notification service, analytics pipeline |
| **M9** | **Mobile = chat-only, honestly.** Phones get `/chat` + inline cards. Admin work (configuring agents) is desktop-honest with a "open on desktop" toast. | responsive admin pages nobody can use, mobile-form purgatory |
| **M10** | **Subdomain = workspace, path = agent.** `acme.one.ie/refunds` is `/chat` with `(workspace=acme, agent=refunds-bot, viewer=end_user, brand=acme)`. One route, infinite agents. | per-agent route trees, custom router, brand-injection plumbing |
| **M11** | **Starters in, cards out, starters again.** Every chat input shows predicted-intent chips (starters). Every assistant reply ends with predicted-next chips (continuations). Replies in between are interactive cards, not raw text. Conversation = chip → card → chip → card. The user is always one click from the next intent. | type-to-explore paralysis, "what can I ask?", "what now?", read-and-then-type drudgery |

---

## Arrival — the first 60 seconds (M1)

```
visit one.ie
   ↓
/chat opens, anonymous. Ephemeral wallet exists in IndexedDB.
A "demo" agent says hi. You can talk for as long as you want.
   ↓
You type "build me a refund bot". Chat builds it inline.
You type "deploy". Chat shows the URL — but to ship, it needs a key.
   ↓
┌─ Touch ID to keep this ─────────────────┐
│ You built ⌬ refunds-bot.                │
│ It earns $0.50 per chat.                │
│ Save it before you close this tab?      │
│                                         │
│ [✦ Touch ID]              [maybe later] │
└─────────────────────────────────────────┘
   ↓
Passkey created. Wallet promoted from IndexedDB → keychain-wrapped
(passkeys.md State 1 → 2). Workspace `tony.one.ie` claimed automatically.
Agent now lives at tony.one.ie/refunds.
```

**The prompt never says "sign up" or "create account."** It says *keep
this*. The user already has equity (an agent, a wallet) before the
prompt fires. The passkey is the act of *not losing* what they made.

---

## The chat dock (M4 + carries surface context)

Closed (every surface, bottom-right):

```
                                                    ┌────┐
                                                    │ ⌬  │
                                                    └────┘
```

Open (cmd-K or click; slides up from bottom-right, ~420px wide):

```
                          ┌─ ⌬ on /agents · refunds-bot selected ─┐
                          │                                        │
                          │ you: rename to refund-buddy            │
                          │ ⌬ ✓ renamed. live URL unchanged.       │
                          │                                        │
                          │ you: bump price to $1                  │
                          │ ⌬ ✓ $1.00/chat (was $0.50)             │
                          │   ┌─ Pricing ────────────────┐         │
                          │   │ $1.00 USDC per chat      │         │
                          │   │ free first message       │         │
                          │   └──────────────────────────┘         │
                          │                                        │
                          │ > _                              [▶]   │
                          └────────────────────────────────────────┘
```

**The context line at the top is the magic.** The dock injects
`{url, selection, brand, viewer}` as a system signal so chat *knows what
you're looking at*. "rename this" works because "this" is the selected
card. No surface change required — the chat dock IS how you operate
every surface without leaving it.

The maximized form (`/chat` route) is the same component, same substrate
session, full layout. State is shared via `world().add('user:tony')` —
one identity, two presentations.

---

## Starters & generative UI (M11)

The chat input is **never a blank field**. The assistant **never replies
in raw text** for actionable moments. Every turn is shaped:

```
   [empty state]              [one click → ]              [reply ends with]
   ┌─────────────┐            ┌─────────────┐            ┌─────────────┐
   │ ▣ start a   │     →      │ ▣ card with │     →      │ ▣ chips for │
   │   chip      │            │   primary   │            │   next step │
   └─────────────┘            └─────────────┘            └─────────────┘
```

Three placements, one pattern. **The user is always one click from the
next intent**, whether they just arrived, just got a reply, or are
mid-flow.

### The three starter slots

| Slot | When | Example |
| --- | --- | --- |
| **Onset** | Empty chat / new dock open | `[build a refund bot]  [take payments]  [connect Slack]` |
| **Inline** | Inside an assistant card (the primary action) | `[▶ deploy]  [edit]  [refine]` on an AgentPreviewCard |
| **Trailing** | At the end of every assistant reply, predicting what comes next | After "✓ deployed": `[set a price]  [share link]  [test it now]` |

The trailing slot is the one that closes the loop — without it, the user
finishes a flow and stares at a blank input wondering what's possible
*next*. With it, every reply is also a launchpad.

### The card vocabulary (the assistant's grammar)

The assistant doesn't speak in paragraphs — it speaks in shapes:

| Card | Used for |
| --- | --- |
| **AgentPreviewCard** | Showing an agent definition with `[deploy] [edit] [refine]` |
| **DeployStatusCard** | Live progress with checked/pending steps |
| **ResultCard** | Success state with the useful artifact (URL, ID, link) + trailing chips |
| **ChoiceChips** | Disambiguation: "which Shopify store?" → `[acme] [side-project]` |
| **VerifyCard** | Sensitive action confirm: "I'm about to refund 3 txs ($35) — `[confirm] [cancel]`" |
| **PriceCard** | Pricing as live frontmatter (M5): amount slider, currency, free tier |
| **BrandPalette** | 6 swatches with `[apply] [save as theme]` |
| **SkillToggleRow** | Inline skill list with checkboxes |
| **MarketplaceMini** | 3-4 cards for "browse" intents — opens `/skills` or `/tools` if user wants more |
| **TraceMini** | Short substrate trace excerpt with `[open in agent drawer → trace]` |
| **CompareCard** | A vs B (two themes, two prices, two skills) |
| **OnboardingChecklist** | First session only: `✓ wallet · ✓ agent · ☐ deploy · ☐ earn` |
| **EmptyStateCard** | Same shape as page empty state, inline in chat |

Every card has at most **one primary action** and 0-2 secondary chips.
**Trailing chips are not part of the card** — they appear *below* it,
because they're about *what to do next*, not *what's in the card*.

### Adaptive starters (context-aware predictions)

Starters are computed from `(viewer, surface, selection, lifecycle stage,
recent actions)`. Same chat, different chips.

| Context | Onset chips |
| --- | --- |
| **First visit, /chat** | `[build a refund bot]  [take payments without a website]  [what is ONE?]` |
| **Returning, has draft agent** | `[deploy refunds-bot]  [test it first]  [show me what's broken]` |
| **Returning, no revenue yet** | `[share refunds-bot link]  [embed widget on a page]  [add Stripe]` |
| **Dock on /agents, refunds-bot selected** | `[rename]  [duplicate]  [pause]  [show recent failures]` |
| **Dock on /skills** | `[enable email.send on all support agents]  [find healthcare skills]` |
| **Dock on /payments** | `[why did revenue drop?]  [refund last 5 txs]  [withdraw to bank]` |
| **Dock on /design** | `[match acme.com's brand]  [convert to light mode]  [pick a community theme]` |

The starters are **predicted next intents** — not capabilities. "Build a
refund bot" reads as a job, not a feature.

### Worked example — three cards, four clicks, agent earning

User arrives at `/chat`. They click one starter. Everything after is
cards and trailing chips:

```
empty:
  ⌬ Hi! What do you want to ship?
  [build a refund bot]  [take payments]  [connect Slack]
       │
       └─click─▶
            you: build a refund bot

  ⌬ Here's a draft. Want to deploy or refine?
  ┌─ ⌬ refunds-bot (draft) ────────────────┐
  │ skills: shopify.order.find · pay.refund │
  │ tone:   helpful, brief                  │
  │ price:  not set yet                     │
  │ [▶ deploy]  [edit ▾]  [refine via chat] │
  └─────────────────────────────────────────┘
  next? [test in sandbox first]  [add Slack notify]
       │
       └─click [▶ deploy]─▶

  ⌬ Deploying...
  ┌─ Deploying refunds-bot ────────────────┐
  │ ✓ wallet provisioned                   │
  │ ✓ skills pinned                        │
  │ ⟳ allocating subdomain...              │
  │ ☐ live                                 │
  └────────────────────────────────────────┘
       │ (auto)
       ▼
  ┌─ ✦ Touch ID to keep this ──────────────┐  ← M1 fires here
  │ Save refunds-bot before you close tab? │
  │ [✦ Touch ID]            [maybe later]  │
  └────────────────────────────────────────┘
       │
       └─click [✦ Touch ID]─▶

  ⌬ ✓ Live.
  ┌─ ✓ refunds-bot ────────────────────────┐
  │ tony.one.ie/refunds        [copy] [↗] │
  └────────────────────────────────────────┘
  next? [set a price]  [embed on my site]  [share to Slack]
       │
       └─click [set a price]─▶

  ⌬ Pricing for refunds-bot:
  ┌─ Pricing ──────────────────────────────┐
  │ amount   ◀ $0.50 USDC ▶                │
  │ free     ◀ 1 message ▶                 │
  │ chains   ☑ base  ☑ arb  ☐ sui  ☐ eth   │
  │ [save]                                 │
  └────────────────────────────────────────┘
  next? [done — share link]  [also accept SUI]  [add monthly tier]
```

Total: **1 starter click + 3 card actions = agent built, deployed,
saved, priced.** Zero forms. Zero pages visited beyond `/chat`. The user
never typed more than the first sentence.

### When NOT to use a card

Cards are for *interactive shapes*. Plain text is fine for:

- Short factual answers ("yes, refunds-bot is live").
- Explanations the user asked for ("here's how x402 works: ...").
- Errors that don't have a one-click fix ("Stripe API returned 500 —
  retrying in 30s").

Don't wrap a one-line answer in a card just because cards look fancy.
The trailing chips still apply — even pure-text replies end with "next?"
chips when there's a sensible continuation.

### The protocol in one diagram

```
          ┌──────────── one chat session ────────────┐
          │                                          │
  empty   │  starters ──▶ user picks ──▶ assistant   │
          │                                ↓         │
          │                           emits card     │
          │                                ↓         │
          │             ◀── user clicks ── card has  │
          │             │   primary action            │
          │             ↓                              │
          │      next card OR text reply              │
          │             ↓                              │
          │      trailing chips ◀──────────────────── │
          │             │                              │
          │             └──▶ (loop)                    │
          └───────────────────────────────────────────┘
```

Three slots, one card vocabulary, infinite paths through the product.

---

## URL anatomy (M10)

```
acme.one.ie / refunds                              ← end-user URL
└─ workspace └─ agent                                  
                                                       
            ↓ middleware: lookup (acme, refunds), set context
                                                       
  /chat route renders with:
    workspace = acme        ← brand inheritance (M10 + M2)
    agent     = refunds-bot ← agent context loaded
    viewer    = end_user    ← derived: no passkey for acme = end_user
    brand     = acme tokens ← workspace's /design choices apply
```

**One route. Three context params. Infinite agents.** The brand follows
the workspace; the mask follows the viewer's relationship to the
workspace (owner = developer, stranger = end_user). No new routing, no
brand-injection plumbing — the existing `viewer` context does the work.

Custom domain (`refunds.acme.com` → `acme.one.ie/refunds`) is a CNAME +
host-header rewrite in the middleware; no UI changes downstream.

---

## Empty states (M7) — one pattern, everywhere

Every grid's first cell, when nothing exists yet:

```
┌─ + your first agent ──┐
│                       │
│  describe what you    │
│  want it to do:       │
│                       │
│  ┌─────────────────┐  │
│  │ > _        [▶]  │  │
│  └─────────────────┘  │
│                       │
│  or pick a template ▾ │
└───────────────────────┘
```

Same shape for first skill ("describe a verb"), first tool ("which app
to connect"), first payment ("paste a wallet, or generate one"). **The
empty state IS a card with a chat input** — affordance and explanation
collapse to one thing.

---

## Mobile (M9) — chat-only, honestly

```
phone (sm) — end-user view:        tablet (md+) — developer view:
┌──────────────┐                   ┌──┬───────────────────────┐
│ ⌬ acme       │                   │◇ │ /agents               │
│ ─────        │                   │◇ │ ▦ ▦ ▦                 │
│ chat msg     │                   │◇ │ ▦ ▦ ▦                 │
│ chat msg     │                   │◇ ├───────────────────────┤
│ ┌─ pay ──┐   │                   │  │       chat dock ▾    │
│ │ $5 →   │   │                   │  └───────────────────────┘
│ │ [✓]    │   │                   └──┴───────────────────────┘
│ └────────┘   │
│              │                   on phone, accessing /agents:
│ > _    [▶]  │                   ┌──────────────────────────┐
└──────────────┘                   │  ⌬ admin work is best on │
                                    │  desktop. Open this URL  │
                                    │  on your laptop:         │
                                    │  one.ie/o/x9k2 [copy]   │
                                    └──────────────────────────┘
```

End users on phones get the full product (chat + payment cards).
Developers on phones get a polite "open on desktop" with a one-tap
device-handoff link. This is honest: configuring agents on a 375px
viewport is a worse experience than walking to a laptop.

---

## /chat — the primary surface

**Purpose:** everything happens here.
**Composition:** `Chat (full)` + inline `Card`s for rich blocks (payment confirms, agent summaries, embed snippets).

```
┌─ Chat ─────────────────────────────────────── /chat ─┐
│                                                       │
│  you: build me a refund bot for shopify              │
│                                                       │
│  ⌬ I'll build a refund-handling agent.                │
│     ┌─ Agent: refunds-bot ───────────────────────┐    │
│     │ skills:  shopify.order.find · pay.refund   │    │
│     │ tone:    helpful, brief                    │    │
│     │ deploy:  acme.one.ie/refunds               │    │
│     │                                            │    │
│     │ [▶ deploy]   [edit in /agents]             │    │
│     └────────────────────────────────────────────┘    │
│                                                       │
│  you: deploy it                                      │
│                                                       │
│  ⌬ Live. Share this with customers:                  │
│     ┌────────────────────────────────────────────┐    │
│     │  acme.one.ie/refunds        [copy] [test]  │    │
│     └────────────────────────────────────────────┘    │
│                                                       │
│  > _                                            [▶]  │
└───────────────────────────────────────────────────────┘
```

Inline cards = rich messages (`docs/rich-messages.md`). They carry
actions; clicking them deep-links to the relevant sidebar surface only
if the user *wants* detail.

**Friction killers:**
- No "create agent" button anywhere. You ask, it builds.
- Deploy is one word in chat, not a 5-step wizard.
- Every rich card has a *primary action* and a *see more* link.

---

## /agents — gallery of personas

**Purpose:** see what you've built. Open one to refine.
**Composition:** `Grid<AgentCard>` + chat dock + `[+ new from chat]`.

```
┌─ Agents ──────────────────────────────────── /agents ┐
│  search: ____           sort: recent ▾      [+ chat] │
│                                                       │
│  ┌─ refunds-bot ────────┐  ┌─ onboard ─────────────┐ │
│  │ ⌬                    │  │ ⌬                     │ │
│  │ shopify · pay        │  │ docs · email          │ │
│  │ 1.2k chats · ★ 4.7   │  │ 340 chats · ★ 4.9     │ │
│  │ live · acme.one.ie/r │  │ live · acme.one.ie/h  │ │
│  └──────────────────────┘  └───────────────────────┘ │
│                                                       │
│  ┌─ leadqual ───────────┐  ┌─ + new ───────────────┐ │
│  │ ⌬ (draft)            │  │                       │ │
│  │ sheets · slack       │  │   describe an agent   │ │
│  │ not deployed         │  │   in chat →           │ │
│  │ [edit] [deploy]      │  │                       │ │
│  └──────────────────────┘  └───────────────────────┘ │
└───────────────────────────────────────────────────────┘
```

Click a card → **drawer** slides in (M3). Six tabs, all lenses on the
same agent — no separate detail pages, no settings forms (M5):

```
┌─ ⌬ refunds-bot · live · acme.one.ie/refunds ────────────────────── [✕] ┐
│ definition · chats · trace · revenue · generations · connect           │
├────────────────────────────────────────────────────────────────────────┤
│ definition (markdown frontmatter — chat to edit)                       │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ ---                                                                │ │
│ │ name: refunds-bot                                                  │ │
│ │ price: $0.50/chat   first message free                             │ │
│ │ embed: { width: 400, theme: inherit, allow: ['acme.com'] }         │ │
│ │ skills: [shopify.order.find, pay.refund]                           │ │
│ │ tone: helpful, brief                                               │ │
│ │ ---                                                                │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ [chat dock: "raise price to $1"]                                       │
└────────────────────────────────────────────────────────────────────────┘
```

The **6 tabs are the closure for 5 separate gaps**:

| Tab          | Closes gap                                  | Source (M8: substrate trace) |
| ---          | ---                                         | --- |
| definition   | settings forms, pricing, embed config (M5)  | the agent's `.md` file       |
| chats        | conversation history                        | `signal` events filtered     |
| trace        | logs / observability                        | `mark`/`warn` events filtered|
| revenue      | per-agent earnings                          | x402 receive events filtered |
| generations  | versioning / rollback / eval diffs          | L5 EVOLUTION events          |
| connect      | API/SDK snippet, embed code, MCP endpoint   | derived from agent + workspace |

**Friction killers:**
- "+ new" is a chat prompt, not a blank form (M7).
- Agent state badge auto-transitions: `draft → live` on deploy,
  `live → paused` on >10% error rate over 100 chats, `live → evolving`
  during L5 prompt rewrite. Manual override in chat: "pause refunds-bot".
- Deploy gate: every `[▶ deploy]` runs a 3-prompt eval first; failures
  block + show the failing prompt as a chat reply (not a modal).

---

## /skills — verbs the agent can call

**Purpose:** see what each agent *can do*. Toggle on/off.
**Composition:** agent picker (top) + `Grid<SkillCard>` (two zones: enabled / available).

```
┌─ Skills ──────────────────────────────────── /skills ┐
│  Agent: refunds-bot ▾                        [+ chat] │
│                                                       │
│  Enabled (3)                                          │
│  ┌─ shopify.order.find ─┐ ┌─ pay.refund ────────┐   │
│  │ ✓ active             │ │ ✓ active             │   │
│  │ 8.4k calls · 99% ok  │ │ 1.1k calls · 100% ok │   │
│  │ free                 │ │ free · earns $0.001  │   │
│  └──────────────────────┘ └──────────────────────┘   │
│                                                       │
│  Available (browse →)                                 │
│  ┌─ email.send ─────────┐ ┌─ slack.post ─────────┐   │
│  │ ☐ disabled           │ │ ☐ disabled           │   │
│  │ ★ 4.6 · 12k installs │ │ ★ 4.8 · 40k installs │   │
│  │ [enable]             │ │ [enable]             │   │
│  └──────────────────────┘ └──────────────────────┘   │
└───────────────────────────────────────────────────────┘
```

Click a skill card → **drawer**, 4 tabs (M3). Same drawer for both
zones (enabled / available); the action button changes:

```
┌─ pay.refund · v2.4 · ★ 4.9 ──────────────────────────────────── [✕] ┐
│ definition · usage · code · cost                                     │
├──────────────────────────────────────────────────────────────────────┤
│ definition (frontmatter — chat to edit if you author it)             │
│ ┌────────────────────────────────────────────────────────────────┐   │
│ │ ---                                                            │   │
│ │ name: pay.refund                                               │   │
│ │ inputs:  { order_id: string, amount?: number, reason?: string }│   │
│ │ outputs: { refund_id: string, status: 'queued'|'done' }        │   │
│ │ scopes:  [stripe.refund]                                       │   │
│ │ price:   $0.001/call (free first 100/mo)                       │   │
│ │ ---                                                            │   │
│ │ Issues a refund on the original payment method...              │   │
│ └────────────────────────────────────────────────────────────────┘   │
│                                                                      │
│ [✓ enabled on refunds-bot]   [enable on another agent ▾]             │
└──────────────────────────────────────────────────────────────────────┘
```

| Tab        | What's in it                                                              |
| ---        | ---                                                                       |
| definition | Frontmatter + prose (M5). Inputs/outputs schema, scopes needed, price.   |
| usage      | Where you've enabled it (your agents, recent calls, success rate). Global counts (consumer view) or per-agent invoker list (author view) — viewer mask (M2). |
| code       | The handler. Read-only for consumers; chat-editable for authors.          |
| cost       | If you author it: revenue. If you use it: what you'll pay per call + free tier. Same data, two lenses (M2 + M8). |

**Friction killers:**
- Default skills come pre-enabled by agent type — no checkbox tour.
- The `available` zone *is* the marketplace (M6). No `/marketplace` route.
- Toggling is one click, no confirm. Reversible.
- `[enable on another agent ▾]` skips the "go to /agents → pick → /skills → toggle" trip — cross-surface action via a single dropdown.

---

## /tools — external integrations

**Purpose:** connect Slack / Stripe / GitHub / 250 more once, use anywhere.
**Composition:** `Grid<ToolCard>` (two zones: connected / available) + OAuth `Form` flow.

```
┌─ Tools ───────────────────────────────────── /tools ─┐
│  [+ chat: "connect slack"]                            │
│                                                       │
│  Connected (3)                                        │
│  ┌─ Slack ──────────────┐ ┌─ Stripe ─────────────┐   │
│  │ ◉ acme-co            │ │ ◉ acct_1Abc          │   │
│  │ 6 skills enabled     │ │ 4 skills enabled     │   │
│  │ [manage]             │ │ [manage]             │   │
│  └──────────────────────┘ └──────────────────────┘   │
│                                                       │
│  Add a tool (250+ via Composio)                       │
│  ┌─ search ─────────────────────────────────────┐    │
│  │ > shopify_                                   │    │
│  └──────────────────────────────────────────────┘    │
│  ┌─ Shopify ────────────┐ ┌─ Notion ─────────────┐   │
│  │ 12 skills            │ │ 8 skills             │   │
│  │ [connect]            │ │ [connect]            │   │
│  └──────────────────────┘ └──────────────────────┘   │
└───────────────────────────────────────────────────────┘
```

Click a tool card → **drawer**, 4 tabs (M3):

```
┌─ Slack · acme-co · ◉ connected ──────────────────────────────── [✕] ┐
│ connection · skills · activity · scopes                              │
├──────────────────────────────────────────────────────────────────────┤
│ skills (this tool provides 6 verbs)                                  │
│ ┌────────────────────────────────────────────────────────────────┐   │
│ │ ✓ slack.post           used by onboard-bot · 320 calls/wk     │   │
│ │ ✓ slack.dm             used by support-bot · 88 calls/wk      │   │
│ │ ✓ slack.channels.list  used by onboard-bot · 12 calls/wk      │   │
│ │ ☐ slack.pin                                                    │   │
│ │ ☐ slack.search                                                 │   │
│ │ ☐ slack.user.profile                                           │   │
│ └────────────────────────────────────────────────────────────────┘   │
│                                                                      │
│ Last call: 2m ago · slack.post → #support · 200 OK                   │
│ [reconnect]   [tighten scopes]   [disconnect]                        │
└──────────────────────────────────────────────────────────────────────┘
```

| Tab        | What's in it                                                            |
| ---        | ---                                                                     |
| connection | Workspace it's linked to · auth status · OAuth account · `[reconnect]` `[disconnect]` |
| skills     | Every verb this tool provides; toggle visible per agent (links to `/skills` drawer) |
| activity   | Recent calls, latency, failures. Substrate trace (M8) filtered to this tool. |
| scopes     | OAuth permissions granted. Tighten without re-auth where the provider supports it. |

**Friction killers:**
- One auth flow per tool, ever. Composio handles 250 on one screen.
- Connecting Slack auto-enables `slack.post` on relevant agents — no
  second trip to `/skills` (the dropdown in the agent's `/skills` drawer
  also reflects this).
- Search-first; the grid below shrinks as you type.
- `[tighten scopes]` is a *reduce-permission* action — no friction; it
  expands only requires re-auth.

---

## /payments — wallet, revenue, x402

**Purpose:** see money in, money out, your accept-payment link.
**Composition:** `Card` (wallet) + `Card` (revenue) + `Grid<TxRow>` + accept-link `Card`.

```
┌─ Payments ─────────────────────────────── /payments ─┐
│  ┌─ Wallet ──────────────┐  ┌─ Revenue (7d) ──────┐  │
│  │ tony.eth              │  │  $1,420.40          │  │
│  │ USDC   1,240.00       │  │  ▁▂▃▅▇█▆            │  │
│  │ ETH    0.42           │  │  +18% vs last week  │  │
│  │ [send]  [receive]     │  │  [details]          │  │
│  └───────────────────────┘  └─────────────────────┘  │
│                                                       │
│  ┌─ Accept payments ─────────────────────────────┐    │
│  │ pay.one.ie/u/tony                  [copy link] │    │
│  │ [embed widget]  [api docs]  [test it]          │    │
│  └────────────────────────────────────────────────┘    │
│                                                       │
│  Recent                                               │
│  + $5.00   alice.eth → refunds-bot     2m ago        │
│  + $5.00   bob.sui   → refunds-bot     5m ago        │
│  − $0.40   x402 fee                    8m ago        │
│  + $50.00  stripe payout               1h ago        │
└───────────────────────────────────────────────────────┘
```

/payments has **three drawer types** (one per object class):

### Wallet drawer (click the wallet card)

```
┌─ tony.eth · 0.42 ETH · $1,240 USDC ──────────────────────────── [✕] ┐
│ balance · history · keys · networks                                  │
├──────────────────────────────────────────────────────────────────────┤
│ keys                                                                 │
│ ┌────────────────────────────────────────────────────────────────┐   │
│ │ Passkey       ✦ Touch ID (Mac · iPhone)        last used 2m   │   │
│ │ Paper backup  ✦ printed 2026-04-12             [verify now]   │   │
│ │ Recovery key  ✦ saved in keychain              [reveal]       │   │
│ └────────────────────────────────────────────────────────────────┘   │
│                                                                      │
│ Quarterly verification: due in 18 days  [run canary tx]              │
│ Status: ✓ all roots reachable (passkeys.md State 5)                  │
└──────────────────────────────────────────────────────────────────────┘
```

| Tab      | What's in it                                                          |
| ---      | ---                                                                   |
| balance  | Per-token, per-chain. `[send]` `[receive]` per row.                   |
| history  | Filterable tx list (also opens tx drawer below).                      |
| keys     | Passkey state, paper break-glass, recovery key (`passkeys.md` §5).    |
| networks | Which chains enabled (SUI / ETH / SOL / BTC / BASE / ARB / OPT).       |

### Transaction drawer (click any tx row)

```
┌─ + $5.00 USDC · alice.eth → refunds-bot · 2m ago ─────────────── [✕] ┐
│ ┌─ Receipt ──────────────────────────────────────────────────────┐   │
│ │ amount    $5.00 USDC                                           │   │
│ │ from      alice.eth                                            │   │
│ │ to        refunds-bot · agent wallet 0x4a...                   │   │
│ │ via       x402 (one-shot, no auth)                             │   │
│ │ tx        0x42b8...e8a · view on basescan ↗                    │   │
│ │ gas       $0.0004 (sponsored)                                  │   │
│ └────────────────────────────────────────────────────────────────┘   │
│ ┌─ Substrate trace ──────────────────────────────────────────────┐   │
│ │ alice.eth → refunds-bot      mark +1.0   path strength 0.91    │   │
│ │ refunds-bot → pay.refund     mark +0.8   path strength 0.84    │   │
│ └────────────────────────────────────────────────────────────────┘   │
│ [refund]   [block sender]   [export receipt]                         │
└──────────────────────────────────────────────────────────────────────┘
```

No tabs — single object. The trace section makes M8 visible: every
payment is also a substrate event with marks.

### Accept-link drawer (the developer's monetization config)

```
┌─ pay.one.ie/u/tony · live ───────────────────────────────────── [✕] ┐
│ preview · pricing · embed · webhook                                  │
├──────────────────────────────────────────────────────────────────────┤
│ pricing (frontmatter — chat to edit)                                 │
│ ┌────────────────────────────────────────────────────────────────┐   │
│ │ ---                                                            │   │
│ │ amount:   $5.00                                                │   │
│ │ currency: USDC                                                 │   │
│ │ chains:   [base, arb, sui]                                     │   │
│ │ recurring: false                                               │   │
│ │ free_tier: 0                                                   │   │
│ │ ---                                                            │   │
│ └────────────────────────────────────────────────────────────────┘   │
│                                                                      │
│ [chat dock: "make it $10 monthly"]                                   │
└──────────────────────────────────────────────────────────────────────┘
```

| Tab     | What's in it                                                                |
| ---     | ---                                                                         |
| preview | What the payer sees on `pay.one.ie/u/tony` — exact card render.            |
| pricing | Frontmatter (M5): amount, currency, chains, recurring, free tier.          |
| embed   | `<iframe>` snippet, allowed origins, theme (`inherit` / `light` / `dark`). |
| webhook | URL to POST on success/failure, signing secret, retry policy.              |

**Friction killers:**
- The accept-link is on the page on first load — no setup ceremony.
- Wallet appears on first visit (M1); passkey is the only auth.
- Pricing changes via chat ("make it $10 monthly") — frontmatter edit
  (M5), no settings form.
- Refunds are one click on the tx drawer (no support ticket round-trip).
- Quarterly canary verification (`mac.md`) surfaces in the wallet drawer
  — silent breakage is impossible.

---

## /design — the 6 tokens, live

**Purpose:** brand the whole app in 6 colors.
**Composition:** current theme (live editor) + `Grid<ThemeCard>` (yours / community — M6) + theme drawer for management (M3).

```
┌─ Design ─────────────────────────────────── /design ─┐
│ Current: midnight-violet  [save as ▾]  [reset]       │
│                                                       │
│ ┌─ Live preview ────────────────────────────────────┐ │
│ │ ┌─ Card ─────────┐  Buttons [P][S][T][O][G]       │ │
│ │ │ Title   badge  │  Inputs  ┌──────┐ ☑ ◉ ○        │ │
│ │ │ ┌────────────┐ │  Chat    ⌬ hello                │ │
│ │ │ │ inner      │ │  Grid    ▦ ▦ ▦                  │ │
│ │ │ └────────────┘ │                                  │ │
│ │ └────────────────┘                                  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                       │
│ Tokens (click swatch → color picker popover)          │
│ ▦ background  ▦ foreground  ▦ font                    │
│ ▦ primary     ▦ secondary   ▦ tertiary                │
│ [chat dock: "make it warm"]                           │
│                                                       │
│ Your themes                                           │
│ ┌─▦▦midnight──┐ ┌─▦▦daylight──┐ ┌─▦▦+ from chat────┐ │
│ │ in use       │ │ saved        │ │ "describe vibe"  │ │
│ └──────────────┘ └──────────────┘ └──────────────────┘ │
│                                                       │
│ Community  (popular this week)                        │
│ ┌─▦▦acme──────┐ ┌─▦▦lavender──┐ ┌─▦▦terminal-green─┐ │
│ │ ★ 4.8 · 2k   │ │ ★ 4.7 · 1k   │ │ ★ 4.9 · 3k       │ │
│ │ [try it]     │ │ [try it]     │ │ [try it]         │ │
│ └──────────────┘ └──────────────┘ └──────────────────┘ │
└───────────────────────────────────────────────────────┘
```

Click a theme card → **drawer**, 4 tabs (M3):

```
┌─ midnight-violet · ★ 4.8 · 2.1k forks ──────────────── [✕] ┐
│ preview · tokens · usage · share                            │
├─────────────────────────────────────────────────────────────┤
│ tokens (frontmatter — chat to edit if you own it)           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ---                                                     │ │
│ │ name:        midnight-violet                            │ │
│ │ background:  #0a0a0f                                    │ │
│ │ foreground:  #14141c                                    │ │
│ │ font:        #f5f5f7                                    │ │
│ │ primary:     #6688cc                                    │ │
│ │ secondary:   #9ba0ad                                    │ │
│ │ tertiary:    #99bb88                                    │ │
│ │ ---                                                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [✓ in use on tony.one.ie]   [fork to edit]   [share URL]    │
└─────────────────────────────────────────────────────────────┘
```

| Tab     | What's in it                                                            |
| ---     | ---                                                                     |
| preview | Full primitives at this theme (live, scaled).                          |
| tokens  | The 6 hex values (M5: frontmatter). Chat-edit if owned; fork if not.    |
| usage   | Workspaces / agents using this theme. For community themes: install count.|
| share   | Public URL (`design.one.ie/t/midnight-violet`), embed snippet, fork count.|

**Friction killers:**
- 6 tokens, not 60 (`.claude/rules/design.md`).
- "make it warm" via chat re-rolls all 6 to a coherent palette — no
  color theory required.
- Preview *is* every primitive at once — what you see is what ships.
- Community themes are a one-click `[try it]` — applied to live preview
  immediately; only persists if you `[save as]`. Reversible.
- The theme drawer's `share` URL is a public preview of any theme — even
  unsaved. Themes are first-class shareable artifacts (M6).
- Brand on shared agent: when an end user lands on `acme.one.ie/refunds`,
  the workspace's current theme loads via the host header (M10). No
  brand-injection plumbing.

---

## /settings — profile, keys, billing

**Purpose:** the boring page. Mostly empty by default.
**Composition:** left nav rail + right panel that's *either* a `Form` (for
flat config) or a `Grid<ItemCard>` + drawer (for collections).

```
┌─ Settings ──────────────────────────────── /settings ─┐
│ ◇ Profile           │  Profile                        │
│ ◇ Wallets           │                                 │
│ ◇ Keys & devices    │  Name      ┌──────────────────┐ │
│ ◇ API & MCP         │            │ Tony O'Connell   │ │
│ ◇ Workspaces        │            └──────────────────┘ │
│ ◇ Domains           │  Email     tony@one.ie          │
│ ◇ Webhooks          │  Handle    @tony                │
│ ◇ Notifications     │  Avatar    [⌬]                  │
│ ◇ Members           │  Theme     ◉ dark ○ light ○ auto│
│ ◇ Billing           │                                 │
│ ◇ Audit log         │  [save]                         │
│ ◇ Danger zone       │                                 │
└────────────────────────────────────────────────────────┘
```

The 12 categories split into **flat forms** (most) and **collections
with drawers** (the ones with multiple items). Three categories use the
drawer pattern (M3); the rest are forms.

### Categories that are flat forms

`Profile · Notifications · Billing · Danger zone` — single-record
config, just a `Form` on the right.

### Categories that are collections (Grid + drawer)

**Keys & devices** (right panel = grid of devices + recovery)

```
│ ◇ Keys & devices    │  Passkeys                       │
│                     │  ┌─ MacBook · Touch ID ───────┐ │
│                     │  │ added 2026-01-12          │ │
│                     │  │ last used 2m ago          │ │
│                     │  └────────────────────────────┘ │
│                     │  ┌─ iPhone · Face ID ─────────┐ │
│                     │  │ added 2026-03-04          │ │
│                     │  └────────────────────────────┘ │
│                     │  [+ add device]                 │
│                     │                                 │
│                     │  Recovery (passkeys.md §5)      │
│                     │  Paper backup ✓ printed         │
│                     │  Recovery key ✓ in keychain     │
│                     │  [verify all]                   │
```

Click a device card → drawer: `details · scope · activity` — when
added, what it can sign, recent uses. `[revoke]` is the only action.

**API & MCP** (right panel = grid of keys/endpoints)

```
│ ◇ API & MCP         │  API keys                       │
│                     │  ┌─ prod ──────────┐ ┌─ dev ──┐ │
│                     │  │ sk_a8b3...e12   │ │ sk_4f9 │ │
│                     │  │ used 2m ago     │ │ unused │ │
│                     │  │ all scopes      │ │ read   │ │
│                     │  └─────────────────┘ └────────┘ │
│                     │  [+ new key]                    │
│                     │                                 │
│                     │  MCP endpoints (for Claude/Cursor)│
│                     │  acme.one.ie/mcp        [copy]  │
│                     │  ┌─ Cursor config ────────────┐ │
│                     │  │ {"mcpServers": {...}}      │ │
│                     │  └────────────────────────────┘ │
```

Click an API key card → drawer: `details · scope · usage · rotate` —
last calls, rate-limit status, scope checkboxes, one-click rotate (old
key has 24h grace).

**Workspaces · Members · Domains · Webhooks · Audit log** — same
collection-with-drawer pattern.

### A representative drawer — Domains

```
┌─ refunds.acme.com → tony.one.ie/refunds ──────────── [✕] ┐
│ dns · routing · cert · activity                          │
├──────────────────────────────────────────────────────────┤
│ dns                                                      │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ CNAME   refunds.acme.com  →  edge.one.ie            │ │
│ │ status  ✓ verified (last check 2m ago)               │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ routing                                                  │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ host header → workspace=tony, agent=refunds (M10)    │ │
│ │ end-user view → brand=tony's current theme           │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ cert: ✓ auto-issued · expires in 89 days · auto-renew    │
│ [chat dock: "point checkout.acme.com to checkout-bot"]   │
└──────────────────────────────────────────────────────────┘
```

Custom domains map directly onto M10 — the host header becomes a context
param. Adding a domain via chat is the friction-free path; the form is
the fallback for users who already have a CNAME plan.

**Friction killers:**
- Sensible defaults so this page is rarely visited.
- API keys auto-rotate via `[rotate]` — old key has a 24h grace window;
  no breakage on rotation.
- Devices show *what they can sign* in their drawer scope tab — passkey
  permissions visible, not just "device added on date X."
- Custom domains are end-to-end self-serve: CNAME, cert, routing — the
  drawer shows each step's status with a single re-check button.
- "Danger zone" deletes are reversible for 30 days (soft-delete with a
  `[restore]` chip in the audit log).
- MCP endpoint snippet is right there — no docs hunt for Cursor/Claude
  Code users wiring up the workspace as an MCP server.

---

## Three audiences (M2 in action — viewer mask, no separate routes)

`viewer = creator | developer | end_user` is **derived from identity**,
not configured. No passkey → `end_user`. Passkey + workspace owner →
`developer`. Passkey + workspace owner + ONE staff → `creator`. The mask
follows the trust relationship, automatically.

| Surface     | Creator (us)              | Developer (our users)        | End user (their users) |
| ---         | ---                       | ---                          | ---                    |
| /chat       | substrate trace + chat    | tool calls collapsed + chat  | clean chat + rich cards|
| /agents     | full library + eval       | their agents + available     | hidden                 |
| /skills     | author + revenue          | toggle per agent             | hidden                 |
| /tools      | provider catalog          | OAuth + connected list       | hidden                 |
| /payments   | substrate revenue         | wallet + accept-link         | inline confirm only    |
| /design     | token authoring           | brand their workspace        | passive (sees brand)   |
| /settings   | + workspace + substrate   | profile + billing            | minimal (name/theme)   |

End users only ever see `/chat`. Sidebar is hidden in their viewer.

---

## Notifications & global search (M4 + M8 — no new surface)

Both fold into the chat dock:

- **Search** — cmd-K opens the dock. Type a query; the assistant
  navigates ("opening refunds-bot drawer"), highlights, or summarizes.
  No separate `/search` page. The dock is the search palette.
- **Notifications** — substrate `mark`/`warn` events with high salience
  (revenue spike, agent failure, evolution event) emit a count badge on
  the dock icon. Opening the dock shows them as a system reply:
  "⌬ 3 things happened: refunds-bot earned $50; scout error-rate 18%;
  evolution L5 fired on greeter." Each line is a deep-link.

One stream (M8: substrate trace), three lenses (logs in agent drawer,
notifications in dock, revenue in /payments).

---

## Friction map (gap → move that closes it)

| Friction point                       | Without ONE             | Closed by | In ONE                                          |
| ---                                  | ---                     | ---       | ---                                             |
| Sign-up wall                         | email / password / OTP  | M1        | passkey only on first save; chat works anon     |
| First agent                          | blank editor, fields    | M7        | empty state IS a card with chat input           |
| First skill enabled                  | tour, checkboxes        | (defaults)| pre-enabled per agent type; chat to add more    |
| First tool connected                 | OAuth maze              | M6        | Composio in /tools available zone, one auth     |
| First payment received               | KYC, bank, wait         | M1        | passkey wallet at first save, x402 ready        |
| First brand                          | designer + tokens.json  | M5        | 6 swatches + chat: "make it warm"               |
| Detail view                          | new route + back button | M3        | drawer over the grid                            |
| Cross-surface edits                  | tabs, breadcrumbs       | M4        | chat dock: "do X" from anywhere                 |
| Per-agent settings                   | settings forms × N      | M5        | markdown frontmatter, chat-edited               |
| Pricing setup                        | wizard, plans, stripe   | M5        | "set price to $0.50" in chat → frontmatter      |
| Embed configuration                  | dashboard config form   | M5        | "embed: 400px, only acme.com" in chat           |
| Agent versioning / rollback          | git, deploys, configs   | M3 + M8   | generations tab in drawer, one-click rollback   |
| Logs / debugging                     | log infra, trace UI     | M3 + M8   | trace tab in drawer = filtered substrate stream |
| API/SDK access per agent             | docs hunt, key copying  | M3        | connect tab in drawer = generated snippet       |
| Marketplace discovery                | separate /marketplace   | M6        | "available" zone of the relevant surface        |
| Notifications                        | notification service    | M4 + M8   | dock icon badge; substrate is the source        |
| End-user URL routing                 | per-agent route trees   | M10       | subdomain + path → context params on `/chat`    |
| Brand on shared agent                | brand-injection plumbing| M2 + M10  | workspace tokens load from URL host             |
| Mobile admin                         | broken responsive forms | M9        | desktop-honest with one-tap handoff link        |
| Logout / multi-account               | session juggling        | M1        | per-passkey identity; switch in user menu       |

**Drawers > routes** for detail. **Chat dock > forms** for cross-surface
edits. **Frontmatter > settings** for per-agent config. **Cards > tables**
for scanning. **Grids > lists** for choosing. **Forms only for the
boring page** (`/settings → profile`).

---

## Implementation seed

| Piece | Path | Notes |
| --- | --- | --- |
| Sidebar | `web/src/components/nav/Sidebar.tsx` | 220px → 56px → hidden on sm |
| Chat dock | `web/src/components/chat/ChatDock.tsx` | shared island w/ `/chat`; cmd-K trigger; `world().add('user:tony')` shared session |
| Surface context | `web/src/lib/surface-context.ts` | injects `{url, selection, brand, viewer}` as system signal to chat |
| Viewer ctx | `web/src/lib/viewer.ts` | derived from passkey + workspace role; not configurable |
| Workspace router | `web/src/middleware.ts` | host + path → `(workspace, agent, viewer, brand)` (M10) |
| AgentCard | `web/src/components/agents/AgentCard.tsx` | grid item; opens drawer |
| AgentDrawer | `web/src/components/agents/AgentDrawer.tsx` | 6 tabs: definition · chats · trace · revenue · generations · connect |
| SkillCard / ToolCard | `web/src/components/{skills,tools}/*Card.tsx` | enabled/available zones (M6) |
| EmptyCard | `web/src/components/ui/EmptyCard.tsx` | one component for every empty state (M7) |
| Drawer | `web/src/components/ui/Drawer.tsx` | for *detail*, never new routes (M3) |
| Save-prompt | `web/src/components/auth/PasskeyKeepThis.tsx` | the "Touch ID to keep this" card (M1) |
| Routes new | `skills.astro`, `tools.astro`, `payments.astro`, `settings.astro` | shells |
| Routes done | `chat.astro`, `agents.astro`, `design.astro` | refine to match composition |

Cycle classifier — each route shell is `lean` (spec is this doc, exit =
Lighthouse 100% on `/chat` preserved + the friction map passes end-to-end
in a click-test). Aggregate todo: `one/sidebar-refactor-todo.md` when
work starts. The 10 moves are *invariants* — any plan that breaks one is
the plan being wrong, not the move.

---

*4 primitives. 7 surfaces. 1 chat dock. 3 masks. 10 moves. The lifecycle bends toward zero clicks.*
