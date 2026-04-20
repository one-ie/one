---
title: TODO Rich Messages — Signal Extensions for Discord/Web/Telegram
type: implementation
version: 1.0.0
priority: Unlock handoff links + referrals + wallet integration
total_tasks: 16
completed: 16
status: COMPLETE
---

# Rich Messages: Embeds, Threads, Reactions

**Goal:** Extend Signal's `data` field with rich message metadata (embeds, threads, reactions) without modifying Signal type itself. Enable Discord-native formatting, Web custom rendering, and Telegram text fallbacks.

**Outcome:** Agents and humans exchange structured messages, payment links, handoff URLs, and referrals through a unified Signal interface.

**Source of truth:** [rich-messages.md](rich-messages.md), [lifecycle.md](one/lifecycle.md)

---

## Routing Diagram

```
Agent Response (LLM output)
        │
        ├─ Detect need for rich format (confidence, data complexity)
        │
        ├─ Wrap in RichMessage { type, content, embed/thread/reaction }
        │
        ├─ Emit Signal { receiver, data: { rich: {...} } }
        │
        ├─ Persist to D1 + TypeDB
        │
        ├─ Route to channel adapter
        │       ├─ Discord → unwrap embed, send { embeds: [...] }
        │       ├─ Web → render custom EmbedComponent
        │       └─ Telegram → format as bold text + key-value
        │
        └─ User receives rich format (embeds, threads, reactions, buttons)
```

---

## Cycle 1: WIRE — Rich Message Types + Discord

**Goal:** Add RichMessage interface, Discord embed support, Web fallback.

**Files:**
- `nanoclaw/src/types.ts` — add RichMessage interface
- `nanoclaw/src/channels/index.ts` — update sendDiscord for embeds
- `src/components/ChatMessage.tsx` — add RichEmbed component

**Scope:** 3 files, ~200 edits

### Wave 1 — Recon (Haiku x 2)

| Agent | Target | What to find |
|-------|--------|--------------|
| R1 | `nanoclaw/src/types.ts` current Signal shape | How is Signal used across channels? What can we extend in data? |
| R2 | `nanoclaw/src/channels/index.ts` sendDiscord | How do we post to Discord now? Can we add embeds? |

---

### Wave 2 — Decide (Opus, unsharded)

**Decision 1: RichMessage Interface**

```typescript
interface RichMessage {
  type: 'text' | 'embed' | 'thread' | 'reaction'
  content: string  // Fallback for all channels
  embed?: {
    title: string
    description: string
    fields: { name: string; value: string }[]
    color?: number
    thumbnail?: { url: string }
  }
  thread?: {
    parentId: string
    depth: number
  }
  reactions?: string[]
}
```

**Decision 2: Discord Embed Sending**

```typescript
// In sendDiscord()
if (signal.data?.rich?.embed) {
  // POST with { embeds: [{ title, description, fields, color }] }
} else {
  // Plain text fallback
}
```

**Decision 3: Web Rendering**

Create `<RichEmbed>` component that renders embed as card with fields, color accent, optional thumbnail.

---

### Wave 3 — Edits (Sonnet x 2)

| Agent | File | What |
|-------|------|------|
| E1 | `nanoclaw/src/types.ts` | Add RichMessage interface (40 lines) |
| E2 | `nanoclaw/src/channels/index.ts` | Add embed branch in sendDiscord (50 lines) |

---

### Wave 4 — Verify (Sonnet x 1)

**Checks:**
- [ ] RichMessage interface is exported and typed
- [ ] Discord sends embeds with title, description, fields, color
- [ ] Telegram/Web fallback to plain content
- [ ] Signal type unchanged (frozen)
- [ ] D1 schema can store rich_type + rich_data JSON

**Rubric ≥ 0.70:**
- Fit: Rich messages send to Discord?
- Form: Code clean, no Signal type changes?
- Truth: Embed actually renders in Discord?
- Taste: Interface intuitive for router/channels?

---

## Cycle 2: PROVE — Threads + Reactions + Web

**Goal:** Add thread support (Discord threads, Web threads), reactions (Discord emoji, Web buttons), Web custom components.

**Files:**
- `nanoclaw/src/channels/index.ts` — thread creation
- `src/components/RichEmbed.tsx` — embed + thread rendering
- `src/components/ReactionButtons.tsx` — reaction UI

**Scope:** 3 files, ~250 edits

### Waves 1-4 (same pattern)

---

## Cycle 3: GROW — Lifecycle Integration

**Goal:** Wire rich messages into wallet handoffs, referral links, agent → human bridging.

**What this enables:**
- Agent sends Discord embed with "Buy" button → links to wallet
- Web shows referral link in rich message → share with friend
- Human clicks "Handoff to agent" button → message goes back

**Files:**
- `nanoclaw/src/lib/browser.ts` — fetch payment link metadata
- `src/components/ChatMessage.tsx` — render wallet/referral buttons
- `src/pages/api/handoff.ts` — new endpoint for agent → human transfer

**Scope:** 3 files, ~200 edits

---

## Task List (16 tasks)

### CYCLE 1: WIRE (Rich Message Types + Discord)

- [x] **W1-R1** Recon types.ts Signal shape
- [x] **W1-R2** Recon channels/index.ts Discord sending
- [x] **W2** Opus decide: RichMessage interface + Discord embeds + Web rendering
- [x] **W3-E1** Sonnet edit: add RichMessage to types.ts
- [x] **W3-E2** Sonnet edit: add embed branch to sendDiscord
- [x] **W3.5** Sonnet micro-edit: dispatcher threads rich to sendDiscord
- [x] **W4-V1** Rubric 0.84 (fit: 0.90, form: 0.85, truth: 0.75, taste: 0.85)
- [x] **W4** CYCLE 1 COMPLETE (signal frozen, embeds wired, dispatcher fixed)

### CYCLE 2: PROVE (Threads + Reactions)

- [x] **W1** Recon Discord threads API + Web thread UX
- [x] **W2** Opus decide: thread nesting depth, reaction UI (emoji vs buttons)
- [x] **W3** Sonnet edit: thread creation + reaction handlers
- [x] **W4-V1** Rubric 0.88 (fit: 0.90, form: 0.90, truth: 0.85, taste: 0.85)
- [x] **W4** CYCLE 2 COMPLETE (threads nested + Discord routed, Web indented + parent badge)

### CYCLE 3: GROW (Lifecycle + Handoffs)

- [x] **W1** Recon wallet integration + referral patterns
- [x] **W2** Opus decide: rich message → payment link flow, human ← agent handoff
- [x] **W3** Sonnet edit: embed wallet buttons, handoff endpoints
- [x] **W4-V1** Rubric 0.90 (fit: 0.88, form: 0.92, truth: 0.90, taste: 0.88)
- [x] **W4** CYCLE 3 COMPLETE (payment metadata wired, reactions → handoff buttons, D1 migration ready)

---

## Documentation Updates

**Write during planning (W2), verify after implementation (W4).**

### Docs Updated

| Doc | Changes | Cycles |
|-----|---------|--------|
| **rich-messages.md** | RichMessage interface, thread/payment/reaction types, lifecycle | 1-3 |
| **dictionary.md** | "Rich Messages (Cycle 1-3 extension)" section, `data.rich` convention | 3 |
| **TODO-template.md** | "Documentation Updates (W2 + W4)" framework for all future TODOs | Meta |

### W4 Verification ✓

- [x] **Terminology** — `rich`, `embed`, `thread`, `reaction`, `payment` consistent across docs
- [x] **Examples** — Code in rich-messages.md matches types.ts interfaces
- [x] **Cross-refs** — Doc links point to real files
- [x] **Metaphor** — Rich messages fit ant/pheromone model (threads propagate signals, payments mark paths)
- [x] **Rubric** — Documentation quality scored as fit/form/truth/taste

### Retrospective

**Lesson:** Should document DURING W2 (Decide), not after W4 (Verify). Next TODO will follow: plan docs in W2, edit docs+code in W3, verify both in W4.

---

## See Also

- [rich-messages.md](rich-messages.md) — Rich message spec (updated 2026-04-15)
- [dictionary.md](dictionary.md) — Canonical names (updated 2026-04-15)
- [TODO-template.md](one/TODO-template.md) — Documentation-first workflow (updated 2026-04-15)
- [lifecycle.md](one/lifecycle.md) — Complete lifecycle (auth, wallet, handoff)
- [claw.md](claw.md) — Claw integration
- [TODO-claw.md](TODO-claw.md) — Claw feature roadmap

---

*Rich messages unlock bidirectional communication: agents send structured data to humans, humans send payments and requests back.*
