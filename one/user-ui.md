# User UI — Options

Six layout concepts for the `/u/<slug>` experience. Each trades off surface area,
discovery, and cognitive weight differently.

---

## Option A — Split: profile left, chat right

The canonical two-pane. Profile/files on the left, chat fills the right.
Owner sees everything at once; chat is always reachable.

```
┌──────────────────────────────────────────────────────────────────┐
│  @alice                                          ⚙  Share  ···  │
├──────────────┬───────────────────────────────────────────────────┤
│              │                                                   │
│  Pages       │   Hi! I'm your AI assistant. Ask me to           │
│  ──────────  │   create pages, agents, or skills.               │
│  › about     │                                                   │
│  › services  │   ┌─────────────────────────────────────────┐    │
│              │   │ page/about                     pending  │    │
│  Agents      │   │ ─────────────────────────────────────── │    │
│  ──────────  │   │ # About Alice                           │    │
│  › support   │   │ I build tools for...                    │    │
│              │   │                                         │    │
│  Skills      │   │              [ Discard ]  [ Approve ✓ ] │    │
│  ──────────  │   └─────────────────────────────────────────┘    │
│  › refund    │                                                   │
│              │   ┌─────────────────────────────────────────┐    │
│  ┄┄┄┄┄┄┄┄┄┄  │   │ Ask anything…                      ↑   │    │
│  Recovery    │   └─────────────────────────────────────────┘    │
│  Settings    │                                                   │
└──────────────┴───────────────────────────────────────────────────┘
```

**Pros:** everything visible; no navigation needed; natural for power users  
**Cons:** crowded on mobile; sidebar steals space from chat

---

## Option B — Chat-first, files as a drawer

Chat fills the viewport. File index is a slide-in drawer. Clean for visitors;
owner opens the drawer when needed.

```
┌──────────────────────────────────────────────────────────────────┐
│  @alice                                    [ Files ≡ ]  ⚙       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                                                                  │
│   Hi! What would you like to create today?                       │
│                                                                  │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │ page/user-guide                              pending     │   │
│   │ ──────────────────────────────────────────────────────── │   │
│   │ # User Guide                                             │   │
│   │ Welcome to your ONE space...                             │   │
│   │                                               [ ✓ Sign ] │   │
│   └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Create a skill that handles refunds…                 ↑   │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘

                         ── drawer open ──

┌──────────────────────────────────────────────────────────────────┐
│  Files                                                      ✕   │
├──────────────────────────────────────────────────────────────────┤
│  Pages                                                           │
│    about · services · user-guide                                 │
│                                                                  │
│  Agents                                                          │
│    support · sales                                               │
│                                                                  │
│  Skills                                                          │
│    process-refund · csv-analyzer                                 │
└──────────────────────────────────────────────────────────────────┘
```

**Pros:** chat is the hero; mobile-first; visitors don't see owner chrome  
**Cons:** files feel secondary; owner needs an extra tap

---

## Option C — Card grid dashboard + floating chat

Profile page is a card grid. Chat floats as a persistent widget bottom-right.
Clicking a card opens that content. Chat is always accessible.

```
┌──────────────────────────────────────────────────────────────────┐
│  @alice · Your AI space                            ⚙  Share      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐     │
│  │  📄 Pages  (3) │  │ 🤖 Agents  (2) │  │ ⚡ Skills  (4) │     │
│  │                │  │                │  │                │     │
│  │  about         │  │  support       │  │  process-refund│     │
│  │  services      │  │  sales         │  │  csv-analyzer  │     │
│  │  user-guide    │  │                │  │  summarise     │     │
│  │                │  │                │  │  translate     │     │
│  │  [ + New ]     │  │  [ + New ]     │  │  [ + New ]     │     │
│  └────────────────┘  └────────────────┘  └────────────────┘     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  💰 Wallet · 0.00 USDC          [ Connect ]            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│                                                          ╭────╮  │
│                                                          │ 💬 │  │
│                                                          ╰────╯  │
└──────────────────────────────────────────────────────────────────┘

                    ── chat widget open ──

┌──────────────────────────────────────────────────────────────────┐
│                                                ╭──────────────╮  │
│                                                │ Chat      ✕  │  │
│                                                │ ──────────── │  │
│                                                │ Hi! Create   │  │
│                                                │ a new page?  │  │
│                                                │              │  │
│                                                │ ┌──────────┐ │  │
│                                                │ │ Ask…   ↑ │ │  │
│                                                │ └──────────┘ │  │
│                                                ╰──────────────╯  │
└──────────────────────────────────────────────────────────────────┘
```

**Pros:** dashboard feel; great for owners managing multiple files; wallet visible  
**Cons:** two modes (dashboard + chat) to maintain; higher complexity

---

## Option D — Timeline / feed

Content appears as a reverse-chronological feed. Chat is at the top to create more.
Feels like a personal blog + command line.

```
┌──────────────────────────────────────────────────────────────────┐
│  @alice                                            ⚙  ···        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  What do you want to create?                          ↑   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ── Today ──────────────────────────────────────────────────     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  📄 page/user-guide                        2 min ago  ↗   │  │
│  │  Welcome to your ONE space. This guide covers...           │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ⚡ skill/process-refund  · $0.05 USDC     1 hr ago   ↗   │  │
│  │  Handles refund requests. Accepts payment via x402.        │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ── Yesterday ──────────────────────────────────────────────     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  🤖 agent/support                          yesterday  ↗   │  │
│  │  Customer support agent with refund + escalation skills.   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Pros:** narrative arc; shows activity over time; simple mental model  
**Cons:** discovery is linear; hard to navigate to specific files quickly

---

## Option E — Terminal aesthetic

Full-width dark terminal. Commands and responses in monospace. For developers.
Chat IS the UI — no separate panel.

```
┌──────────────────────────────────────────────────────────────────┐
│  one@alice ∿                                                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  $ ls                                                            │
│  page/about  page/services  agents/support  skills/refund        │
│                                                                  │
│  $ create skill that handles refunds at $0.05 USDC              │
│                                                                  │
│  ↳ writing skills/process-refund.md ...                         │
│                                                                  │
│  ╔══════════════════════════════════════════════════╗            │
│  ║  PENDING  skills/process-refund.md               ║            │
│  ║  ────────────────────────────────────────────    ║            │
│  ║  # Process Refund                                ║            │
│  ║  accepts: [{amount: 0.05, token: USDC}]          ║            │
│  ║                                                  ║            │
│  ║  [ discard ]                    [ sign ✓ ]       ║            │
│  ╚══════════════════════════════════════════════════╝            │
│                                                                  │
│  $ _                                                             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Pros:** zero chrome; pure signal; beloved by developers  
**Cons:** alienating for non-technical users; file navigation is typed

---

## Option F — Bento grid (recommended)

Dashboard top, full-width chat below. Bento cards summarise key metrics.
Chat expands on focus. Best of C + A without the complexity.

```
┌──────────────────────────────────────────────────────────────────┐
│  @alice                                            ⚙  Share      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  3 Pages     │  │ 2 Agents │  │ 4 Skills │  │ 0.00 USDC  │  │
│  │  ─────────── │  │ ──────── │  │ ──────── │  │ ────────── │  │
│  │  about       │  │ support  │  │ refund   │  │  Wallet    │  │
│  │  services    │  │ sales    │  │ csv      │  │            │  │
│  │  user-guide  │  │          │  │ + 2 more │  │ [Connect]  │  │
│  └──────────────┘  └──────────┘  └──────────┘  └────────────┘  │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   What would you like to build?                                  │
│                                                                  │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │ page/user-guide                                pending   │   │
│   │ ──────────────────────────────────────────────────────── │   │
│   │ # User Guide · Welcome to your ONE space...              │   │
│   │                                    [ Discard ] [ Sign ✓ ]│   │
│   └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Create a skill, page, or agent…                      ↑   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Pros:** counts at a glance; wallet visible; chat is primary; one scroll  
**Cons:** bento cards add build time; needs responsive collapse on mobile

---

## Comparison

| | Mobile | Discoverability | Build effort | Best for |
|---|---|---|---|---|
| A Split | ⚠ cramped | ✅ high | low | power owners |
| B Drawer | ✅ great | ⚠ hidden | low | visitors first |
| C Cards + float | ✅ ok | ✅ high | medium | dashboard owners |
| D Timeline | ✅ great | ⚠ linear | low | bloggers |
| E Terminal | ⚠ bad | ⚠ typed | low | developers |
| **F Bento** | ✅ ok | ✅ high | medium | **recommended** |

---

## Recommendation

**F (Bento)** for the owner view.  
**B (Drawer)** for public/visitor view — visitors don't need the bento header.

The owner lands on F. A visitor landing on `/u/alice/` sees B — the chat is front
and centre with a drawer for browsing content. One codebase, two render modes based
on whether the slug matches a passkey in the browser.
