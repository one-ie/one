# modify-todo

> **Spec (source of truth):** [`modify.md`](modify.md)
> **Companions:** [`agent-spec-todo.md`](agent-spec-todo.md) (C1–C7 shipped) · [`design.md`](design.md)
> **Mode:** mixed — seven cycles, lean once picked
> **Lifecycle:** construction → production

C1–C7 shipped the core substrate. This TODO closes the gap between
*working code* and *production-ready product*. The lens throughout is the owner:
someone who wants a real website and AI agents that earn money — not a developer
exploring the substrate.

---

## Goals

### Owner goals (what they're trying to do)
```
1. Have a real website they can show clients today          ← first 10 minutes
2. Build an AI assistant that represents them              ← first hour
3. Earn money when visitors use their agents/skills        ← first week
4. Control their identity — own their keys, own their data ← always
```

### Platform goals (what we're trying to do)
```
1. Zero-to-published in under 60 seconds
2. Every Face ID = an irreversible act of ownership
3. Show the path from "hello" to "my agent just earned $0.02"
4. Never make the owner feel like a developer
```

### Are they being met today?

| Goal | Met? | Gap |
|------|------|-----|
| Real website to show clients | ✗ | No theme, no sharable URL shown, raw file paths visible |
| AI assistant that represents me | ~50% | Write works, but chat prompt talks about "signal substrate" not their site |
| Earn money from agents | ✗ | x402 gate not wired in chat.ts — skills exist but can't be paid |
| Own my keys | ~70% | Passkeys work, but recovery codes never shown, device management missing |
| Zero to published <60s | ~60% | Registration fast, but new user lands with no direction |
| Face ID = ownership | ~80% | Works in dev; **passkeys break in production** (RP_ID=localhost in wrangler.toml) |

---

## Critical findings (recon 2026-05-05)

### Blocker 1 — Passkeys break in production
`wrangler.toml` `[vars]` has `RP_ID=localhost` and `ORIGIN=http://localhost:8787`.
These are plaintext env vars shipped to production Workers. Every passkey registration
and commit will fail on `one.ie`. The fallback `url.hostname` in provision.ts is correct
but is overridden by the wrangler.toml vars.

**Fix:** Remove `RP_ID` and `ORIGIN` from `[vars]`; they auto-resolve from `url.hostname`
and `url.origin` — which is exactly what production needs.

### Blocker 2 — OwnerControls shows Edit to all visitors
`GET /api/provision?probe=1&slug=X` only checks `slugExists()` — not whether the
current user owns the slug. Edit and New buttons render for every visitor on every
existing slug. The write is still passkey-protected (no CSRF risk), but every visitor
sees confusing owner UI.

**Fix:** Replace server probe with `navigator.credentials.get({ mediation: 'silent' })`
as specified in `modify.md` §Identity — the passkey conditional mediation probe is the
correct ownership check without a server round-trip.

### Blocker 3 — Chat talks to developers, not site owners
The system prompt says *"You are ONE — a helpful assistant for the ONE substrate…
signal-based AI substrate where agents earn paths through verified outcomes."*
When an owner lands at `/u/bright-fox-1742/chat` after registering, the chat sounds
like an SDK tutorial, not their personal assistant. Starter prompts: *"Show me the
signal highways"*, *"Explain pheromone routing"*.

**Fix:** Slug-scoped chat.ts injects a site-building system prompt and context-aware
starters based on whether `existingFiles` is empty (first visit) or populated.

### Blocker 4 — x402 payment gate not wired
Skills with `price > 0` exist in R2. The chat loads them. But `chat.ts` has no
payment gate — paid skills run free. The whole "earn money" value proposition
is broken at the revenue step.

### Gap 5 — Recovery codes never shown
`provision.ts` creates the owner record and redirects to chat. No recovery codes
are generated or displayed. If the owner loses their device, their site is unrecoverable.
The spec says show BIP39 codes once at provision.

### Gap 6 — Settings is 70 lines with two fields
`settings.astro` only shows wallet and agentverse_key. Missing: device management
(add/remove passkey), domain management UI, recovery email, recovery codes reveal,
storage usage. Owners have no self-service path for the most common day-2 needs.

### Gap 7 — Post-commit UX is invisible
After approving a write, the owner sees a chat message *"✓ Live"* — but the URL
is buried. No prominent "Open page" button. No "share this" moment. The site was just
published and the owner doesn't feel it.

### Gap 8 — /u/<slug>/ shows raw R2 paths
The index page lists files as `blog/my-first-post`, `page/about` — raw storage paths.
No titles, no publish dates, no "New post" shortcut. Not what a site owner expects.

---

## Routing (full system, all cycles shipped)

```
visitor → one.ie/get-yours
  → Face ID → /api/provision → D1 owners INSERT + recovery codes shown
  → /u/<slug>/chat  (system prompt: "You're building @alice's site. No files yet. Start here ↓")
                    (starters: "Create my homepage" / "Write an about page" / "Add a pricing page")
owner types: "create a homepage with my portfolio"
  → write tool → PreviewCard: live preview + "Approve with Face ID" + "Open when live"
  → Face ID → /api/commit → R2 PUT → cache purge
  → chat: "✓ Live at one.ie/u/alice/ — [Open ↗]"
  → /u/alice/   shows: "Welcome to Alice's Site" (title from site.md once C8 ships)
                       [Portfolio] [About] [Blog]  ← real page titles not raw paths

owner types: "add a support agent that charges $0.02"
  → write agents/support.md + skills/handle-complaint.md (price:0.02)
  → visitor opens /u/alice/chat?agent=support
  → asks a question → chat returns payment envelope: "This costs $0.02. Pay to continue."
  → visitor signs x402 → receipt verified → skill runs → alice's wallet earns

owner opens /u/alice/settings:
  → Identity: slug, copy public URL, QR code
  → Passkeys: list of devices, [+ Add this device], [Remove]
  → Recovery: show codes button (requires Face ID to reveal), set recovery email
  → Domain: [+ Connect your domain] → TXT verify → CF API
  → Wallet: payout address
  → Danger: export .zip, delete site
```

---

## Schema reference

| Surface | Change | Migration |
|---------|--------|-----------|
| D1 `owners` | adds `recovery_hash`, `recovery_email`, `tos_hash`, `tos_signed_at`, `webhook_url`, `redirect_mode`, `display_name` | `0005_owners_v3.sql` |
| D1 `notifications` | `(id PK, slug, kind, payload JSON, ts, read INT DEFAULT 0)` | `0006_table_stakes.sql` |
| D1 `reports` | `(id PK, host, path, kind, body, ts, status TEXT DEFAULT 'open')` | `0006_table_stakes.sql` |
| R2 | `<slug>/site.md` (new kind); `<slug>/_recovery/<hash>.json` (never public) | — |

---

## Cycle map

```
C11  Production launch    RP_ID fix, ownership probe, chat prompt, x402 gate    UNBLOCKS customer testing
C12  Onboarding          recovery codes, TOS, display name, first-run UX        UNBLOCKS customer retention
C13  Owner UX            post-commit URL, index titles, settings completeness    UNBLOCKS day-2 loop
C8   Site identity       site.ts, compile tool, theme injection                  polished brand
C9   Discoverability     sitemap, robots, history UI, export                     real site
C10  Platform trust      notifications, report, storage cap, domain API          safe platform
C14  Revenue             x402 gate in chat.ts, skill pricing, payout             earns money  ← BLOCKER fixed in C11
```

Dependencies:
- **C11 is first** — without it, nothing works in production and chat is misleading
- **C12 requires C11** (recovery codes need owners v3 migration)
- **C13 requires C11** (settings rewrite needs clean state)
- **C14 requires C11** (x402 gate needs correct slug-scoped chat)
- **C9 requires C8** (robots.txt reads site.md robots: field)
- **C10 independent** of C8/C9

---

## Cycle 11 — Production launch (URGENT)

**Goal:** Passkeys work on `one.ie`. OwnerControls only shows Edit to the actual owner.
Chat talks to site owners, not developers. Paid skills don't run free.

**Classifier:** `mode: lean` · `lifecycle: construction` · 4/4 priors.

**Files:**

| File | Purpose | Budget |
|------|---------|--------|
| `web/wrangler.toml` | Remove `RP_ID` and `ORIGIN` from `[vars]` — both resolve correctly from `url.hostname`/`url.origin` at runtime; keep as comment noting prod values | −2 |
| `web/src/components/OwnerControls.tsx` | Replace server probe with `navigator.credentials.get({ mediation: 'silent', rpId: slug })` — if assertion succeeds, show buttons; if AbortError/NotAllowed, hide. Per `modify.md` §Identity | ~40 |
| `web/src/pages/api/chat.ts` | (a) Slug-scoped system prompt: inject owner name, site context, empty-state guidance vs returning-user guidance. (b) Slug-scoped starters: first visit → `["Create my homepage","Write an about page","Add a pricing page","Create an AI agent"]`; has files → `["Update my homepage","Add a blog post","Improve my support agent"]`. (c) x402 payment gate: before running a skill whose frontmatter has `price > 0`, return `{ kind:'pending-payment', skill, price, wallet }` — visitor signs via `x402.md` contract | +50 |
| `web/src/pages/api/provision.ts` | `probe=1` now checks `credential_id` match via `Authorization` header (passkey assertion) rather than `slugExists` — or remove probe entirely and rely on client-side mediation | ~5 |

**Tasks:**

| id | value | effort | exit | tags |
|----|-------|--------|------|------|
| C11-T1 | critical | S | Deploy to production; passkey registration + commit succeed on `one.ie` | infra, passkey |
| C11-T2 | critical | S | Visitor to `/u/<slug>/` sees no Edit button; owner on same page sees Edit | ownership, ui |
| C11-T3 | critical | M | Fresh slug chat shows site-building starters; returning owner sees contextual starters | chat, ux |
| C11-T4 | high | M | Chat with `price:0.02` skill returns payment envelope before running skill body | x402, revenue |

**Exit scalar:** Deploy to production. Register passkey on `one.ie` → succeeds. Open another browser (not owner) → no Edit button. Owner browser → Edit button. Visit `/u/<slug>/chat` fresh → see "Create my homepage" starter. tsc clean. Rubric ≥ 0.65.

**Rubric target:** security ≥ 0.92 / stability ≥ 0.88 / simplicity ≥ 0.88 / speed ≥ 0.85.

---

## Cycle 12 — Onboarding

**Goal:** Owner's first 10 minutes feel considered. Recovery codes shown once. TOS captured.
Display name personalises the experience. No owner can lose access without warning.

**Classifier:** `mode: lean` · `lifecycle: construction` · 4/4 priors.

**Depends on:** C11 (needs owners v3 migration for `recovery_hash`, `display_name`).

**Files:**

| File | Purpose | Budget |
|------|---------|--------|
| `web/migrations/0005_owners_v3.sql` | `ALTER owners ADD COLUMN recovery_hash TEXT, recovery_email TEXT, tos_hash TEXT, tos_signed_at INT, display_name TEXT` | 8 |
| `web/src/pages/get-yours.astro` | (a) Add display name input (optional, default = 'site owner'). (b) Add TOS checkbox with hash of current TOS text — passkey signature covers TOS hash. (c) Post-provision: show recovery codes page before redirecting to chat | +20 |
| `web/src/pages/api/provision.ts` | Generate 12 BIP39 words from `crypto.getRandomValues`; PBKDF2-hash → `recovery_hash`; store hash in D1; return words in POST response (never stored, shown once); store `display_name`, `tos_hash`, `tos_signed_at` | +25 |
| `web/src/pages/recovery-codes.astro` | Interstitial page shown once after provision: displays 12 words in 3×4 grid, "Write these down" CTA, "I've saved them" button → redirects to chat. URL includes one-time token so it can't be revisited | 30 |
| `web/src/pages/api/chat.ts` | Inject `display_name` from D1 into system prompt: *"You are the assistant for {name}'s site @{slug}"* | +5 |

**Tasks:**

| id | value | effort | exit | tags |
|----|-------|--------|------|------|
| C12-T1 | critical | S | Migration 0005 applies; `recovery_hash` column exists | infra, d1 |
| C12-T2 | critical | M | Provision flow shows 12 recovery words in interstitial; words not stored server-side; hash stored | recovery, passkey |
| C12-T3 | high | S | TOS checkbox required before button enables; `tos_hash` + `tos_signed_at` written to D1 | tos, legal |
| C12-T4 | med | S | Display name in chat system prompt; chat greets owner by name | ux, chat |

**Exit scalar:** Register with display name "Alice" + TOS checked → recovery-codes page shows 12 words → "I've saved them" → `/u/alice/chat` → system prompt says "Alice's site". D1 row has `recovery_hash` set and `tos_hash` set. Words not in any D1 column. tsc clean. Rubric ≥ 0.65.

**Rubric target:** security ≥ 0.93 (recovery words never persisted) / stability ≥ 0.85 / simplicity ≥ 0.88 / speed ≥ 0.82.

---

## Cycle 13 — Owner UX completeness

**Goal:** Post-commit shows a real "you're live" moment. The index page shows titles not paths.
Settings covers all day-2 owner needs: devices, domain, recovery, storage usage.

**Classifier:** `mode: lean` · `lifecycle: construction` · 4/4 priors.

**Depends on:** C11 (OwnerControls must work correctly first).

**Files:**

| File | Purpose | Budget |
|------|---------|--------|
| `web/src/components/chat/PreviewCard.tsx` | Add post-commit success state: "✓ Live" + prominent [Open page ↗] link + [Copy URL] button + share hint. Also show full content preview (not just 300-char slice) in a scrollable code block with syntax hint | ~50 |
| `web/src/pages/u/[slug]/index.astro` | Parse frontmatter titles from each R2 file (`title` or `name` field); display human title not raw path; show "last edited" from `customMetadata.ts`; add [+ New page] / [+ New post] shortcuts visible to owner (OwnerControls inline CTA); add "Share your site" copy-URL button for owner | ~45 |
| `web/src/pages/u/[slug]/settings.astro` | Expand to full settings surface (replaces current 70-line stub): **Identity** (slug, public URL, QR code, copy link); **Passkeys** (list `owners_keys`, add-device flow via `credentials.create()`, remove with confirmation); **Recovery** (show codes button — requires fresh passkey auth — sends to `/api/settings?action=reveal-codes`; set recovery email); **Domain** (connect custom domain — links to C10 domain API); **Wallet** (payout address); **Storage** (usage bar — links to C10 storage cap); **Export & Delete** (export .zip link; delete site with 2× confirmation) | ~100 |
| `web/src/pages/api/settings.ts` | Extend: handle `action=add-key` (verify existing assertion, then `startRegistration` for new device, INSERT `owners_keys`); `action=remove-key` (verify assertion, DELETE from `owners_keys` if > 1 key remains); `action=reveal-codes` (verify fresh assertion, return `recovery_hash` prompt — owner re-derives from paper words, not stored) | ~60 |

**Tasks:**

| id | value | effort | exit | tags |
|----|-------|--------|------|------|
| C13-T1 | high | M | After approve, PreviewCard shows "✓ Live" + open link; URL is correct | ux, commit |
| C13-T2 | high | M | `/u/<slug>/` shows page titles not raw paths; last-edited timestamp visible | index, r2 |
| C13-T3 | high | L | Settings shows all sections; add-device flow works end-to-end | settings, passkey |
| C13-T4 | med | S | Owner sees "Share your site" button with copy-URL on index | share, ux |

**Exit scalar:** Owner writes "about" page with title "About Alice" → PreviewCard shows "✓ Live at /u/alice/page/about" with [Open ↗] and [Copy] buttons → index page shows "About Alice" not "page/about". Settings page shows device list + [+ Add device] that opens passkey enrollment. tsc clean. Rubric ≥ 0.65.

**Rubric target:** security ≥ 0.88 / stability ≥ 0.88 / simplicity ≥ 0.85 / speed ≥ 0.85.

---

## Cycle 8 — Site identity + compile

**Goal:** Owner sets `site.md` — custom theme, name, nav, font. Every `/u/<slug>/*` page
(including chat) renders their brand. `compile` tool exports agents as Python/MCP/SKILL.md.

**Classifier:** `mode: lean` · `lifecycle: construction` · 4/4 priors.

**Files:**

| File | Purpose | Budget |
|------|---------|--------|
| `web/src/lib/site.ts` | Parse `site.md` frontmatter; validate 6 tokens + font allowlist; emit inline `<style>` block with CSS vars; JSON-LD (`WebSite` / `Article`); per-page meta merge | 50 |
| `web/src/lib/slug.ts` | Extend `getSlugContext` to read `<slug>/site.md`; inject tokens into context; 301 when `domains.verified=true` and `redirect_mode='redirect'` | +20 |
| `web/src/lib/compile.ts` | Re-export `compile({ agent, target })` from `@oneie/sdk/compile`; R2 slug-scoped agent read; return compiled string | 15 |
| `web/src/pages/api/chat.ts` | Add `compile` tool (read-only, no HMAC); `write` file regex allows `site` root kind; inject site name/tagline into system prompt | +20 |

**Tasks:**

| id | value | effort | exit | tags |
|----|-------|--------|------|------|
| C8-T1 | high | M | `site.ts` validates tokens; rejects 7th token; invalid font → system stack | site, design |
| C8-T2 | high | S | `getSlugContext` injects tokens; `/u/<slug>/` `<style>` block has owner's primary colour | slug, css |
| C8-T3 | med | S | `compile` tool in chat returns Python block; no Face ID prompt | compile, tool |
| C8-T4 | med | S | `write` accepts `file:'site'`; next request shows updated theme | write, commit |

**Exit scalar:** Set `theme.primary: "#e11d48"` via write tool → approve → visit `/u/<slug>/` → DevTools shows `--color-primary: #e11d48`. tsc clean. Rubric ≥ 0.65.

**Rubric target:** security ≥ 0.90 / stability ≥ 0.85 / simplicity ≥ 0.85 / speed ≥ 0.80.

---

## Cycle 9 — Discoverability

**Goal:** Every slug has sitemap, robots.txt. Owner can browse version history and restore with one
Face ID. Export everything as a zip — trust signal ("I can leave any time").

**Classifier:** `mode: lean` · `lifecycle: construction` · 4/4 priors.

**Depends on:** C8 (`site.ts` for `robots:` field).

**Files:**

| File | Purpose | Budget |
|------|---------|--------|
| `web/src/pages/u/[slug]/sitemap.xml.ts` | R2 list → XML sitemap; `Cache-Control: max-age=3600`; canonical = custom domain if verified | 20 |
| `web/src/pages/u/[slug]/robots.txt.ts` | Default `Allow: *`; `site.md robots:` override; `Sitemap:` line | 8 |
| `web/src/pages/u/[slug]/history/[file].astro` | Owner-only (silent probe); R2 versioned list → version table with ts + model; Restore = existing `write` flow; `[file]` URL-encoded kind/name | 35 |
| `web/src/pages/u/[slug]/export.ts` | Passkey-gated (assertion in header); zip stream of `<slug>/*` via `@zip.js/zip.js`; excludes `_workspace/` | 30 |

**Tasks:**

| id | value | effort | exit | tags |
|----|-------|--------|------|------|
| C9-T1 | med | S | `GET /u/<slug>/sitemap.xml` returns valid XML with known page URLs | seo |
| C9-T2 | med | S | `GET /u/<slug>/robots.txt` correct default + Sitemap line | seo |
| C9-T3 | high | M | History shows 3 versions; Restore → Face ID → content reverts | history, passkey |
| C9-T4 | high | M | Export with valid assertion → 200 zip containing site.md | export |

**Exit scalar:** Write 3 versions of `blog/test`. Open `/u/<slug>/history/blog%2Ftest` → 3 rows. Restore version 2 → visit blog → content matches. tsc clean. Rubric ≥ 0.65.

---

## Cycle 14 — Revenue

**Goal:** When a visitor triggers a paid skill, the chat returns a payment envelope.
Visitor signs an x402 micropayment. Receipt verified. Skill body runs. Alice's wallet earns.
End-to-end revenue in a single session.

**Classifier:** `mode: lean` · `lifecycle: construction` · 4/4 priors.

**Depends on:** C11 (correct slug-scoped chat), C8 (site context, agent loading).

**Files:**

| File | Purpose | Budget |
|------|---------|--------|
| `web/src/pages/api/chat.ts` | When model invokes a skill with `price > 0`: (a) return `{ kind:'pending-payment', skill, price, wallet, quote }` to stream; (b) add `payment` tool that accepts `{ receipt, signature }`, verifies x402 receipt against `owners.wallet`, then injects skill body as next system message and continues stream | +40 |
| `web/src/components/chat/PaymentCard.tsx` | Rendered by Chat when it sees `kind:'pending-payment'`; shows skill name, price, wallet; [Pay with wallet] button triggers x402 signing flow (per `x402.md`); on receipt → POST back to chat as next message | 40 |
| `web/src/lib/x402.ts` | Server-side receipt verification — validates x402 header signature against wallet address; checks amount ≥ quoted price; idempotency key prevents replay | 35 |

**Tasks:**

| id | value | effort | exit | tags |
|----|-------|--------|------|------|
| C14-T1 | critical | M | Visitor triggers `price:0.02` skill → chat returns PaymentCard, skill body NOT in stream yet | x402, revenue |
| C14-T2 | critical | M | Visitor signs x402 → receipt verified → skill body injects → response streams back | x402, revenue |
| C14-T3 | high | S | `owners.wallet` set in settings; wallet in payment envelope matches | settings, wallet |
| C14-T4 | med | S | Replay of same receipt → rejected (idempotency key check) | security, x402 |

**Exit scalar:** Create skill with `price: 0.02`. Set wallet in settings. Open skill chat as visitor → trigger skill → PaymentCard appears with correct price and wallet. Pay → skill response streams back. Replay same receipt → rejected. tsc clean. Rubric ≥ 0.65.

**Rubric target:** security ≥ 0.95 (replay protection critical) / stability ≥ 0.85 / simplicity ≥ 0.85 / speed ≥ 0.85.

---

## Cycle 10 — Platform trust

**Goal:** Every `/u/<slug>/*` page has a report button. Owners have a notification inbox.
Storage cap enforces free-tier limits. Domain management API wires the CF cert flow.

**Classifier:** `mode: lean` · `lifecycle: construction` · 4/4 priors.

**Independent** of C8/C9. Can run in parallel once C12 migration ships.

**Files:**

| File | Purpose | Budget |
|------|---------|--------|
| `web/migrations/0006_table_stakes.sql` | `notifications(id PK, slug, kind, payload JSON, ts, read INT DEFAULT 0)` + `reports(id PK, host, path, kind, body, ts, status TEXT DEFAULT 'open')` | 12 |
| `web/src/lib/storage-cap.ts` | `checkCap(slug, env)` — R2 list bytes + file count; KV `cap:<slug>:reqs` per request; 80% → warn header; 100% → 429 | 30 |
| `web/src/pages/api/report.ts` | Public POST; IP rate-limit via KV TTL (5/hour); D1 INSERT reports; 201 | 20 |
| `web/src/pages/api/notifications.ts` | Owner-gated (assertion); GET list; POST mark-read; POST set webhook; outgoing HMAC webhook on INSERT | 30 |
| `web/src/pages/api/domain.ts` | Owner-gated; POST `{host}` → generate verify_token, D1 INSERT; POST `{host, action:'verify'}` → DNS TXT lookup → `verified=1` + CF Custom Domain API | 35 |
| `web/src/components/ReportButton.tsx` | Footer on every `/u/<slug>/*`; `emitClick('ui:report:open')`; invisible to owner | 15 |
| `web/src/components/InboxBell.tsx` | Owner-only (silent probe); polls `/api/notifications` 60s; unread badge | 25 |

**Tasks:**

| id | value | effort | exit | tags |
|----|-------|--------|------|------|
| C10-T1 | high | S | Migration 0006 applies clean | infra |
| C10-T2 | high | M | `checkCap` blocks commit at 100%; warn header at 80% | storage |
| C10-T3 | high | S | `POST /api/report` → 201; 6th same IP → 429 | abuse |
| C10-T4 | med | M | InboxBell shows badge after D1 notification insert | notifications |
| C10-T5 | high | M | Domain verify: POST host → token → DNS match → `verified=1` | domain |
| C10-T6 | med | S | ReportButton in footer for visitor; hidden for owner | ui |

**Exit scalar:** Insert notification → InboxBell badge. Submit 6 reports from same IP → 6th is 429. Domain verify flow writes `verified=1` to D1. tsc clean. Rubric ≥ 0.65.

---

## Documentation updates (every cycle's W2)

| Touched | Update |
|---------|--------|
| `modify.md` | Update status header per cycle close; mark shipped files |
| `modify.md` | Fix "8 cycles" claim → correct cycle count |
| `learnings.md` | One-line per cycle close |
| `x402.md` | Add C14 wire-up notes (receipt verification shape) |

---

## Status

**Active cycle:** complete — all 7 cycles shipped

### Cycle 11 ✓
- [x] W1 recon
- [x] W2 decide
- [x] W3 edit
- [x] W4 verify

### Cycle 12 ✓
- [x] W1 recon
- [x] W2 decide
- [x] W3 edit
- [x] W4 verify

### Cycle 13 ✓
- [x] W1 recon
- [x] W2 decide
- [x] W3 edit
- [x] W4 verify

### Cycle 8 ✓
- [x] W1 recon
- [x] W2 decide
- [x] W3 edit
- [x] W4 verify

### Cycle 9 ✓
- [x] W1 recon
- [x] W2 decide
- [x] W3 edit
- [x] W4 verify

### Cycle 14 ✓
- [x] W1 recon
- [x] W2 decide
- [x] W3 edit
- [x] W4 verify

### Cycle 10 ✓
- [x] W1 recon
- [x] W2 decide
- [x] W3 edit
- [x] W4 verify

---

## See also

- [`modify.md`](modify.md) — spec; decisions 1–29; file budgets
- [`agent-spec-todo.md`](agent-spec-todo.md) — C1–C7 ledger (shipped)
- [`x402.md`](../../x402.md) — payment wire format (C14)
- [`design.md`](design.md) — 6-token rule (C8)
- `one/rubrics.md` — gate ≥ 0.65

---

*C11 first. Nothing else ships to customers before passkeys work on one.ie.*
