# modify.md — chat-driven website mutation

A visitor lands on `one.ie`, clicks **Get your site**, signs with passkey, and lands on `one.ie/u/<slug>/chat`. They say *"add a pricing page"* — and the page is live in under a second.

**No CLI. No install. No rebuild. Browser-only.**

> **Implementation scope.** This doc describes the full architecture. The first ship (Cycle 1 of [`agent-spec-todo.md`](agent-spec-todo.md)) is the MVP only:
> - Single passkey per slug (`owners(slug PK, pubkey, credential_id, ts)`)
> - Stateless HMAC challenges (registration + commit), no cookies
> - Random slug; no settings page
> - No recovery codes, no multi-key, no magic-link, no API keys
>
> Recovery codes, multi-key (`owners_keys`), magic-link recovery, settings page, wallet column, agentverse-key encryption, and API-key minting are **Tier 2** — they ship in Cycle 7 (Polish), not C1. The sections below describing those features are architectural intent, not the C1 build list. If you're implementing C1, the scope is the file table in agent-spec-todo.md § Cycle 1.

---

## Two layers

```
┌─ ours, shared ──────────────────────────────────────────┐
│ one.ie                                                   │
│   marketing, /chat, /get-yours, design, the Worker code  │
│   we ship updates via git push → CI → wrangler           │
└──────────────────────────────────────────────────────────┘
                  │ same Worker reads R2 by slug
                  ▼
┌─ theirs, isolated per-slug ─────────────────────────────┐
│ one.ie/u/alice    R2 prefix alice/    D1 owner=alice-key │
│ one.ie/u/bob      R2 prefix bob/      D1 owner=bob-key   │
└──────────────────────────────────────────────────────────┘
```

One Worker. Many sandboxes. Code stays under our control; content is theirs.

---

## Two operations

| Action | When | What happens | Time |
| --- | --- | --- | --- |
| **Provision** | First visit | 1 D1 row + R2 prefix reserved | ~200ms |
| **Publish edit** | Every change | 1 R2 PUT, SSR reads next request | ~50ms |

There is no third operation. "Deploy" is what *we* do upstream; users only ever provision and edit.

---

## Provision

```
visitor → one.ie → click "Get your site"
  1. browser: navigator.credentials.create()       Face ID
  2. POST /api/provision { pubkey }
  3. Worker: generate random slug (e.g. bright-fox-1742)
             D1 INSERT owners(slug, pubkey, ts)
  4. redirect /u/<slug>/chat
```

Random slugs by construction → no squatting, no reserved-list maintenance, no anti-abuse gate needed. Custom slugs are a future paid feature. Provision retries on the (vanishingly rare) D1 unique-constraint collision. The fresh sandbox seeds nothing; `/u/<slug>/` and the chat both render an empty-state CTA: *"Your site is empty. Ask the chat to write your first page."*

---

## Publish edit

```
user (in /u/alice/chat): "add a pricing page"
  ↓
model calls write({ slug:'alice', file:'page/pricing', content:'---\ntitle: Pricing\n---\n# ...' })
  ↓
server returns proposal: { kind:'pending', challenge, file, content }
        challenge = HMAC(SERVER_SECRET,
                         `${slug}|${file}|${sha256(content)}|${ts}|${nonce}`)
  ↓
chat shows preview card: [Approve] [Discard]
  ↓ click Approve
browser: navigator.credentials.get({ challenge })   Face ID
  ↓
POST /api/commit { slug, file, content, challenge, assertion }
  ↓
Worker:  recompute HMAC, check ts<60s + nonce not in LRU
         verify assertion against owners.pubkey
         R2 PUT alice/page/pricing.md
         purge edge cache for /u/alice/page/pricing
  ↓
chat: "✓ Live — open /page/pricing"
```

**One Face ID = approve + sign + publish.** Two round-trips total (model proposal, then commit). No `prepare` endpoint, no KV nonces — the HMAC is self-verifying; an in-memory LRU prevents replay within the 60s window.

---

## Inline edit (no need to open chat)

Every rendered page and index includes a floating control. Owner-only — visibility gated by a silent passkey probe (`navigator.credentials.get({ mediation: 'silent' })`) at page load; if the assertion verifies, the control renders, otherwise nothing ships to the visitor.

| Where | Control | Action |
| --- | --- | --- |
| `/u/<slug>/page/<name>`, `/u/<slug>/blog/<name>` | ✏️ Edit | Opens chat seeded with: *"Editing {file}. Current content: <…>. What change?"* |
| `/u/<slug>/`, `/u/<slug>/blog/`, `/u/<slug>/page/` | ➕ New | Opens chat seeded with: *"Help me write a new {page\|post}."* |

Same `write` tool, same approval flow, same Face ID. Inline edit is purely UX — zero new tools, zero new endpoints.

---

## The single tool

```ts
write({
  slug: string,                                  // owning sandbox
  file: `${'blog'|'page'|'agents'|'skills'|'media'}/${string}` | 'agent' | 'site',
  content: string | null                         // markdown / svg, or null = delete
})
```

The model writes a complete markdown file as one string. Frontmatter (`--- ... ---`) lives in `content`. `null` deletes the file (R2 versioning preserves the prior version, so undo works).

Six kinds of file, one tool. Per-kind frontmatter validation runs at write time:

| Kind | URL | Frontmatter must have | What it is |
| --- | --- | --- | --- |
| `blog/<name>` | `/u/<slug>/blog/<name>` | `title` | A blog post |
| `page/<name>` | `/u/<slug>/page/<name>` | `title` | A static page |
| `agents/<name>` | `/u/<slug>/agents/<name>` | `name` (matches filename) | A persona — chat with it at `/chat?agent=<name>` |
| `skills/<name>` | `/u/<slug>/skills/<name>` | `name`, `price` | A paid capability offered by agents |
| `media/<name>` | `/u/<slug>/media/<name>` | n/a (raw asset) | Logo, favicon, OG image. SVG (text) in v1; raster in cycle 2 |
| `agent` (root) | default chat persona | `name` | The default agent at `/u/<slug>/chat` (no `?agent=`) |
| `site` (root) | applied to all `/u/<slug>/*` | `name` | Site identity — name, theme, nav, logo, social. See *Real sites* below |

`existingFiles` is injected once into the system prompt — model picks unused names without a discovery round-trip.

---

## Storage

| Surface | Lives in | Mutable? |
| --- | --- | --- |
| `one.ie/*` | Worker bundle | No |
| `/u/<slug>/blog/<name>` | R2 `<slug>/blog/<name>.md` | **Yes** (signed) |
| `/u/<slug>/page/<name>` | R2 `<slug>/page/<name>.md` | **Yes** (signed) |
| `/u/<slug>/agents/<name>` | R2 `<slug>/agents/<name>.md` | **Yes** (signed) |
| `/u/<slug>/skills/<name>` | R2 `<slug>/skills/<name>.md` | **Yes** (signed) |
| `/u/<slug>/media/<name>` | R2 `<slug>/media/<name>` | **Yes** (signed) |
| Default agent | R2 `<slug>/agent.md` | **Yes** (signed) |
| Site identity | R2 `<slug>/site.md` | **Yes** (signed) |
| Owner registry | D1 `owners(slug, pubkey, wallet, ts)` | provision-only |
| Domain registry | D1 `domains(host PK, slug, verified, ts)` | settings-only |
| Edit history | R2 object versions | automatic |

R2 versioning gives free undo. No edit log table. `wallet` on owners is the payout address for paid skills (added at provision time, optional).

---

## Agents and skills

Each sandbox is not just a website — it's a **deployable agent system**. Owners create agents and skills the same way they create pages: by talking. The frontmatter contract is `agent-spec.md` (in `one/`); this section names how it plugs into the chat surface.

### What lives where

```
/u/alice/                    ─── alice's site
├── agent.md                  default chat persona
├── agents/
│   ├── support.md            ?agent=support → support persona
│   └── sales.md              ?agent=sales   → sales persona
├── skills/
│   ├── handle-complaint.md   $0.02 per call, used by support
│   └── qualify-lead.md       $0.05 per call, used by sales
├── page/about.md
└── blog/launch.md
```

### Three things change in the chat

| Surface | Without agents | With agents |
| --- | --- | --- |
| `/u/<slug>/chat` | Default ONE assistant | System prompt = body of `agent.md`; tools filtered by `agent.tools`; greeting from `description` + `starters` |
| `/u/<slug>/chat?agent=<name>` | n/a | Loads `agents/<name>.md`; same rules, that persona's mind |
| Skill invocation in any chat | n/a | If a skill matches `when_to_use`, model calls it; if `price > 0`, visitor signs an x402 micropayment to `owners.wallet` before the skill runs |

The chat picks the agent purely from the URL. No separate "switch agent" UI — different URL, different persona, shareable as a link.

### The two read-only tools available to the chat

```ts
crawl({ url, intent })      // existing — fetch a URL as markdown
compile({                   // NEW — emit deployable artifact
  agent: string | null,     // null = default agent.md
  target: 'uagents' | 'mcp' | 'skillmd'
})  // returns the compiled output as a code block in the chat
```

`compile` is read-only — it transforms existing markdown into a download. No signature needed. Owner asks *"compile my support agent for uAgents"* → chat returns a Python file as a fenced block with a download link. Same flow for MCP server JSON or SKILL.md export.

### How visitors pay for skills

A visitor opens `/u/alice/chat?agent=support` and triggers `handle-complaint`. The chat:

1. Computes the skill price from the skill's frontmatter.
2. Returns a `pending-payment` envelope to the visitor: *"This costs $0.02. Pay to continue."*
3. Visitor signs an x402 micropayment to `owners.wallet` (per `x402.md` in the root cluster).
4. Receipt verified → skill body becomes the system prompt for the next turn → response streams back.

Owners earn revenue from their agents without writing a payment integration. The substrate handles it.

### Files and routes added by this layer

| Route | What it renders |
| --- | --- |
| `/u/<slug>/agents/` | Owner-aware index of agents |
| `/u/<slug>/agents/<name>` | Agent profile (description, starters, skills offered) |
| `/u/<slug>/skills/` | Catalog of skills with prices |
| `/u/<slug>/skills/<name>` | Skill detail (price, when-to-use, schemas) |
| `/u/<slug>/chat?agent=<name>` | Same chat route, persona scoped |

These reuse the existing `[kind]/index.astro` and `[kind]/[name].astro` files — `kind` is just one of `blog | page | agents | skills`. **One template per kind would be over-engineering**: a single SSR helper renders any markdown file with kind-aware metadata.

---

## Real sites

A sandbox isn't a *real site* until owners can brand it, name it, and serve it from their own domain. Three additions close the gap — same `write` tool, same Face ID, no new endpoints in the chat surface.

### `site.md` — one file, the whole identity

Singleton at the slug root. Holds everything site-wide: identity, theme, nav, social. Body becomes the homepage hero (above the auto-generated post / page list).

```yaml
---
name: Alice's Studio
tagline: Design and code, in the open
logo: media/logo.svg
favicon: media/favicon.png
og: media/og.png             # Open Graph card
font: Inter                  # name from allowlist; falls back to system
theme:
  primary: "#7c3aed"
  secondary: "#06b6d4"
  tertiary: "#f59e0b"
  background: "#0a0a0f"
  foreground: "#16161e"
  font: "#fafafa"
nav:
  - page/about
  - page/pricing
  - blog
social: { github: alice, x: alicedev, email: alice@example.com }
---

Welcome — I build small things carefully.
```

Constraints, enforced at write time and re-enforced by the build:

- **Theme is exactly the 6 design tokens.** Same shape as `.claude/rules/design.md`. No 7th token. The build's `--color-*: initial` kill still applies, so a stray `bg-zinc-*` from a model emits no CSS.
- **Font is a name, not a URL.** Resolved server-side against an allowlist (~30 Google Fonts). Anything else falls back to system stack. No arbitrary `@font-face` — XSS surface.
- **Nav is opt-in ordering.** Absent → auto from existing pages (alphabetical). Present → only listed entries show. Reordering = rewriting the array.
- **Logo / favicon / og are paths under `media/`.** External URLs allowed in v1 since raster upload is cycle 2.

`getSlugContext(slug)` reads `<slug>/site.md` once per request and injects the 6 tokens into a `<style>` block on `/u/<slug>/*` only. `one.ie/*` is unaffected — it doesn't go through `getSlugContext`. The chat at `/u/<slug>/chat` inherits the theme: owner-branded chat is owner-branded storefront.

### `media/<name>` — assets, same flow

Logos, favicons, OG images. SVG is plain text and works in v1 (fits the `content: string` tool surface):

```ts
write({ slug: 'alice', file: 'media/logo.svg', content: '<svg>...</svg>' })
```

R2 stores at `alice/media/logo.svg`; served at `/u/alice/media/logo.svg`. Versioned, signed, deletable via `content: null`. Raster (PNG / JPG / WebP) lands in cycle 2 with a binary upload through `/api/commit-media` — same HMAC + assertion shape, different content-type, base64 in chat would blow context budgets.

### Custom domains — `alicestudio.com`, not `/u/alice`

The biggest gap between *sandbox* and *real site* is the URL.

```
1. Owner: /u/alice/settings → "Connect a domain"
2. DNS:   CNAME alicestudio.com → one.ie    (apex needs CNAME flattening)
3. POST /api/domain { host }
   D1: INSERT domains(host PK, slug='alice', verified=false, ts)
   Worker → CF API: add Custom Domain to this Worker
4. CF issues cert; verified=true (~2 min)
5. Request handler:
     const slug = host === 'one.ie' ? parseFromPath() : domains.lookup(host)
     return getSlugContext(slug, env)
```

One Worker still serves everything. The only new code is the host→slug lookup at the top of the request handler and a settings flow that calls the CF API. No per-tenant Worker, no Workers for Platforms, no DNS provisioning we run.

**Verification gate.** Before the CF API call, owner adds a TXT record (`one-verify=<random>`) — prevents claiming `microsoft.com`. Standard pattern, ~30s for the user, surfaced in the settings UI as a copy-paste step with live polling.

### What "real" actually means

| Without this | With this |
| --- | --- |
| `one.ie/u/bright-fox-1742` | `alicestudio.com` |
| Default ONE branding everywhere | 6 tokens + logo + font, applied to chat too |
| Auto nav | Curated nav, opt-in |
| No social cards | OG image + name + tagline → real Twitter / Mastodon previews |
| Sandbox | Sellable surface — agents and skills run on the owner's brand |

### Table stakes — the seven things that make it real, not a demo

Identity, theme, and a domain aren't enough. Without these, the first hour exposes the gap.

**1. Analytics — on by default.**
Cloudflare Web Analytics, one script tag injected by `Layout.astro` when `site.md` doesn't opt out. Owner sees pageviews / visitors / referrers in `/u/<slug>/settings → Analytics`. No third-party cookies, no consent banner needed in EU. Free tier; scales with the Worker.

**2. SEO basics.**
- **`/u/<slug>/sitemap.xml`** — auto-generated, one R2 list per request, cached for 1h.
- **`/u/<slug>/robots.txt`** — default `Allow: *`; owner overrides via `site.md` `robots:` field.
- **Per-page meta override.** `page/*.md` and `blog/*.md` accept `description`, `og`, `canonical` in frontmatter. `getSlugContext` merges page-level over site-level.
- **JSON-LD** — `Article` for blog, `WebSite` for root. ~10 LoC in the SSR helper.

**3. Domain ↔ slug 301 policy.**
When `domains(host).verified=true`, the request handler 301s `/u/<slug>/*` → `https://<host>/*` by default. Owner toggle in settings: `redirect | mirror | sandbox-only`. `redirect` is the default to avoid duplicate-content penalties. Set the canonical URL on every page from the same lookup so search engines never see two URLs for one resource.

**4. Versioning UI — surface what R2 already does.**
Every editable page renders a `History` button (owner-only, silent-probe gated). Lists prior R2 versions with `customMetadata.ts` and `customMetadata.model`. **Restore** = a normal `write` with the old content (one Face ID; no special endpoint). The version list is itself just `R2.list({ versioned: true })` — no D1 edit log, consistent with decision #6.

**5. Backup / export — `.zip` of everything.**
`/u/<slug>/settings → Export site` streams a zip of every R2 object under `<slug>/`. Owner-gated by passkey. ~30 LoC using `@zip.js/zip.js` streaming. Trust signal: *"I can leave any time, take everything with me."* Don't make this a v2 promise.

**6. Notifications — owner sees substrate events without email.**
The platform refuses email. So: a substrate `inbox` per slug — D1 `notifications(slug, kind, payload, ts, read)`. Events: skill paid, domain verified, agent failed, comment on post (cycle 2). Surfaced as a bell icon in `/u/<slug>/chat`'s header with unread count. Optional outbound: owner-set webhook URL in settings, fired with HMAC signature. Recovery email is **transactional only** — never used for routine notifications.

**7. Abuse, takedown, and policy — non-negotiable.**
- **Report button** on every `/u/<slug>` page: opens `/report?host=<host>&path=<path>` (no auth needed). D1 `reports(host, path, kind, body, ts, status)`.
- **`abuse@one.ie`** human-monitored.
- **Takedown SLA**: phishing / CSAM / clearly illegal → suspend within 24h; DMCA / disputed → 72h with counter-notice path. Suspended slug serves `503 + notice page` until resolved.
- **Acceptable-use policy** linked from the footer of every `/u/<slug>` page. Slug provision endpoint includes a single TOS acceptance click — passkey signature on the TOS hash captured in `owners(tos_hash, tos_signed_at)`.
- **Storage cap** per slug on free tier: **50MB / 200 files / 10k req·day**. Soft-warned at 80%, hard-blocked at 100%. Paid tiers later; the cap is the abuse limiter, not a revenue gate.

These seven aren't polish. They're the difference between *Alice can show this to her clients* and *Alice can mention us in a tweet.*

### What we still don't do (and won't, in v1)

- **Custom CSS or themes-as-code.** Six tokens or nothing. Arbitrary CSS reintroduces every problem the design system erases.
- **Component-level overrides.** No "make the buttons square." Card / button / input shapes in `.claude/rules/design.md` stay global.
- **Email at the domain.** `alice@alicestudio.com` is a different product (MX, deliverability, abuse). Out of scope.
- **Comments on posts.** Chat is the interaction surface; per-post threads are cycle 2.
- **On-site search.** Small sites don't need it; Pagefind at build-time when content scales.
- **Drafts and scheduling.** Decision #4 — every write is live.

---

## Markdown pipeline

`marked` + `isomorphic-dompurify`. Frontmatter split by regex (`/^---\n(.*?)\n---\n(.*)$/s`). Code highlighting and richer parsing land when content actually needs them.

R2 read on every page request. CF edge caches R2 by default — add `caches.default` only when a real page measures slow.

---

## Identity (passkey, browser-only)

- **First visit** — `navigator.credentials.create()` mints a resident passkey. Private key in secure enclave.
- **Every edit** — `navigator.credentials.get()` signs the HMAC challenge.
- **New device with sync** — discoverable credentials roam via iCloud / Google Password Manager. Visit any `/u/<slug>` page, sign in.

RP ID is `one.ie` (apex). The same passkey could be presented on any `/u/<slug>` page; the server rejects when the assertion's pubkey ≠ `owners.pubkey` for the URL slug.

### When the device doesn't have a passkey

Not every device has biometrics or sync. The owner has four paths in priority order, all using standard WebAuthn — **no new auth code in the chat surface**.

| Situation | Path | What happens |
| --- | --- | --- |
| Desktop without biometrics, but I have a phone with one | **Cross-device hybrid (QR)** | `credentials.get()` shows a QR. Phone scans it, signs with Face ID, returns the assertion over Bluetooth. WebAuthn handles the whole flow; the desktop browser shows the picker automatically. |
| Any browser, any OS | **Hardware security key** (YubiKey, Solo, Titan) | USB / NFC FIDO2 key counts as a passkey. Plug in, tap, signed. Works on Linux Firefox, locked-down corporate laptops, anywhere `credentials.get()` is permitted. |
| New phone or laptop, no synced credentials yet, but I can still reach my email | **Magic link → re-enrol** | Owner-only fallback, opt-in at provision (`settings → recovery email`). Email a one-time link signed by the platform. Clicking it does *not* authenticate a write — it opens the slug and offers `credentials.create()` to enrol a new passkey on this device. The new passkey is added as a co-owner alongside the existing one(s). |
| Lost every device with a passkey on it | **Paper recovery codes** | 12 BIP39-ish words shown once at provision; `recovery_hash` stored in D1. Re-bootstrap a passkey on any device. The codes are the last line of defence; if these are also lost, the slug is unrecoverable by design. |

**What we explicitly refuse:**

- **Passwords.** No password setup, no password reset, no password fallback. The whole point of the passkey-only model is that a stolen password can't write to the slug.
- **SMS-based 2FA.** SIM-swap attacks are the standard breach pattern; we will not pretend SMS is a security factor.
- **Email-only writes.** Email reaches the device, it doesn't authenticate the device. The magic link enrols a new passkey, it does not bypass passkeys.

### Multi-device on purpose, not by accident

Owners can register **multiple passkeys** on the same slug — every device the owner uses ends up in `owners_keys(slug, pubkey, label, registered_at)`. Add via `/u/<slug>/settings → keys → add device` (uses `credentials.create()` against the same RP ID, requiring an existing-device signature first). Remove with the same flow plus a confirmation prompt.

Default after provision: **one** key (the device they signed up on) plus the paper recovery codes. Owners are nudged at provision and again after their first edit to either enrol a second device or write down the recovery codes — a single point of failure is the most common way owners lose access.

### Visitors never need a passkey

Read paths (`/u/<slug>/page/*`, `/u/<slug>/blog/*`, `/u/<slug>/chat` without writes) require no auth at all. A visitor without WebAuthn support can browse, chat, and pay for paid skills via x402 (which uses wallet signatures, not passkeys) without ever encountering a credential prompt. The passkey gate is only on **writes**, and writes are an owner-only action.

### API keys for automation only

For SDK / CLI / CI use cases — *"my GitHub Action edits a blog post on push"* — owners can mint a long-lived `ONE_API_KEY` from `/u/<slug>/settings`. Limited surface: scoped to writes on a single slug, revocable, audited. **Not exposed in the chat UI** (browser-side keys leak too easily). The chat surface stays pure passkey; SDK mode opts in to keys.

---

## Threat model

| Surface | Defends against | Accepts |
| --- | --- | --- |
| HMAC-bound challenge + passkey signature | Anonymous writes, replay, cross-slug presentation | Owner's device compromised → paper recovery |
| Multi-key registry per slug | Single point of failure if one device is lost | Adding a device requires an existing-device signature first |
| Recovery codes (`recovery_hash`) | All devices simultaneously lost or destroyed | Paper code lost too → slug unrecoverable by design (we cannot impersonate the owner to "help") |
| Magic link enrols a passkey, never authenticates a write | Email account takeover writing to the slug | Owner must own at least one trusted device to use the link |
| `marked` + DOMPurify on render | Prompt-injection writing `<script>` into a post | Plain markdown only |

---

## Implementation shape

Eight moves keep the generated code at ~250 lines. Each is a deliberate choice; deviating from one means the budget is wrong, not the move.

1. **Use `@simplewebauthn/{server,browser}`** — never hand-roll CBOR/COSE/attestation. Three imports (`generateRegistrationOptions`, `verifyRegistrationResponse`, `verifyAuthenticationResponse`) plus two on the client (`startRegistration`, `startAuthentication`).
2. **Silent owner probe is client-only** — no server endpoint. Showing the edit button to a non-owner is harmless because the write is signed.
3. **R2 prefix is implicit** — keys created on first write. Provision = 1 D1 INSERT after WebAuthn verify.
4. **Registration challenge in HttpOnly cookie** — page load issues, POST consumes. One `/api/provision`, not two.
5. **Per-edit challenge is HMAC-stateless** — bound to `(slug, file, sha256(content), ts, nonce)`; in-memory LRU prevents replay. No KV.
6. **R2 customMetadata `{ prevSha, ts, model }`** is the audit log. No `edits` table.
7. **`getSlugContext(slug, env)` helper** drives all `/u/[slug]/*.astro` pages. Each route stays ~15 lines.
8. **Owner-aware 404** — missing routes render "Create this?" CTA for owners; same `?seed=` flow as the new button.

### Pseudocode anchors (the three places it's easy to overcomplicate)

**HMAC challenge** (server, on `write` tool's pending return):
```ts
const ts = Date.now()
const nonce = crypto.randomUUID()
const argHash = await sha256(`${slug}|${file}|${await sha256(content ?? '')}|${ts}|${nonce}`)
const challenge = await hmac(env.SERVER_SECRET, argHash)
return { kind: 'pending', file, content, ts, nonce, challenge }
```

**`write` tool's `execute`** (proposes, never writes):
```ts
write: tool({
  inputSchema: z.object({
    slug: z.string(),
    file: z.string().regex(/^(blog|page)\/[a-z0-9-]+$/),
    content: z.string().nullable(),
  }),
  execute: async (args) => makeProposal(args, env),
})
```

**Silent probe** (client, in `OwnerControls`):
```tsx
useEffect(() => {
  startAuthentication({ mediation: 'silent', allowCredentials: [] })
    .then(() => setIsOwner(true))
    .catch(() => {})
}, [])
```

---

## Files (with line budgets)

A budget exceeded by >30% is a smell — re-read the eight moves before pushing past it.

| File | Purpose | Budget |
| --- | --- | --- |
| `web/src/pages/api/chat.ts` | Add `slug` + optional `agent` in body, load persona from R2, `existingFiles` in prompt, `write` returning proposals, `compile` returning artifacts, x402 payment gate for paid skills | +60 |
| `web/src/pages/api/commit.ts` | Verify HMAC + assertion, R2 PUT with metadata, purge cache | 50 |
| `web/src/pages/api/provision.ts` | Verify registration via cookie challenge, generate slug, D1 INSERT | 25 |
| `web/src/pages/get-yours.astro` | Issues registration challenge, calls `startRegistration` on click | 30 |
| `web/src/pages/u/[slug]/index.astro` | Homepage; calls `getSlugContext`, lists files | 20 |
| `web/src/pages/u/[slug]/chat.astro` | Slug-scoped chat; reads `?seed=` | 20 |
| `web/src/pages/u/[slug]/[kind]/index.astro` | Blog/page index; owner-aware 404 if kind empty | 15 |
| `web/src/pages/u/[slug]/[kind]/[name].astro` | SSR reads R2, renders markdown, owner-aware 404 | 25 |
| `web/src/components/chat/PreviewCard.tsx` | Approve/discard; `startAuthentication` on approve | 40 |
| `web/src/components/OwnerControls.tsx` | Silent probe + Edit/New button | 12 |
| `web/src/lib/markdown.ts` | `marked` + DOMPurify; YAML frontmatter parse | 25 |
| `web/src/lib/passkey.ts` | Wraps SimpleWebAuthn server fns + HMAC challenge | 30 |
| `web/src/lib/slug.ts` | `getSlugContext` (now reads `site.md`, returns theme tokens + nav + identity), `listFiles`, slug generator, host→slug lookup | 40 |
| `web/src/lib/site.ts` | Parse `site.md`, validate 6 tokens + font allowlist, build inline `<style>` block | 30 |
| `web/src/pages/api/domain.ts` | New — TXT verify + CF Custom Domain API call + D1 `domains` insert | 35 |
| `web/src/lib/agent.ts` | Load agent/skill from R2, validate frontmatter, build system prompt | 40 |
| `web/src/lib/compile.ts` | uAgents / MCP / SKILL.md emitters (re-export from `@oneie/sdk`) | 15 |
| `web/wrangler.toml` | `CONTENT` (R2, versioned), `DB` (D1), `SERVER_SECRET` | +5 |
| `web/migrations/0001_owners.sql` | `owners(slug PK, recovery_hash, recovery_email, wallet, agentverse_key_enc, ts)` + `owners_keys(slug, pubkey PK, label, registered_at)` (multi-key per slug) | 14 |
| `web/src/pages/u/[slug]/settings.astro` | New — owner-only; manages keys (add/remove device), wallet, recovery email, `agentverse_key_enc`, **custom domain (TXT-verify + connect)** | 70 |
| `web/migrations/0002_domains.sql` | `domains(host PK, slug, verified, txt_token, ts)` | 6 |
| `web/migrations/0003_table_stakes.sql` | `notifications(slug, kind, payload, ts, read)`, `reports(host, path, kind, body, ts, status)`, `owners` adds `tos_hash`, `tos_signed_at`, `webhook_url`, `redirect_mode` | 18 |
| `web/src/pages/u/[slug]/sitemap.xml.ts` | R2 list → sitemap, 1h cache | 20 |
| `web/src/pages/u/[slug]/robots.txt.ts` | Default + `site.md` override | 8 |
| `web/src/pages/u/[slug]/history/[file].astro` | Owner-only version list + Restore (calls `write` with old content) | 35 |
| `web/src/pages/u/[slug]/export.ts` | Streams `.zip` of `<slug>/*` from R2 | 30 |
| `web/src/pages/api/report.ts` | Public — insert into `reports`, rate-limit by IP | 20 |
| `web/src/pages/api/notifications.ts` | Owner-gated — list, mark-read, deliver webhook | 30 |
| `web/src/pages/get-yours.astro` | (extends) — TOS-acceptance signature in registration | +10 |
| `web/src/components/ReportButton.tsx` | Footer on every `/u/<slug>/*` page | 15 |
| `web/src/components/InboxBell.tsx` | Owner-only, polls `/api/notifications` | 25 |
| `web/src/lib/site.ts` | (extends) — JSON-LD + per-page meta merge | +20 |
| `web/src/lib/storage-cap.ts` | Per-slug R2 byte / file / req counter, 80% warn / 100% block | 30 |
| `web/src/pages/api/recover.ts` | New — magic link enrolment endpoint; verifies link signature, opens `credentials.create()` slot, adds new pubkey to `owners_keys` | 35 |
| `chat.md` (root) | Add `write` tool to the rich-message contract | +20 |
| `website.md` (root) | Note `/get-yours` and `/u/<slug>/*` | +10 |
| **Total new code** | | **~590** |

---

## Decisions locked

1. **URL** — `/u/<slug>` path prefix is the default. Custom apex / subdomain via D1 `domains(host → slug)` + CF Custom Domain API + TXT verification. One Worker serves both.
2. **Slug** — random by default (`bright-fox-1742`). Custom is paid, later.
3. **Tool** — one: `write({ slug, file, content })`. Frontmatter in content.
4. **Approval** — one Face ID = sign + publish. No drafts in v1.
5. **Challenge** — HMAC, stateless, 60s + LRU replay window. No KV.
6. **History** — R2 versioning. No D1 edit log.
7. **Cache** — none in v1. Add when measured.
8. **Markdown** — `marked` + DOMPurify. Add `shiki` when needed.
9. **Code edits** — structurally impossible. v2 may offer "eject to GitHub".
10. **Provisioning** — single shared Worker. No CF Workers for Platforms.
11. **Delete** — `write` with `content: null`. R2 versioning is the undo.
12. **Inline edit** — `OwnerControls` on every page, gated by silent passkey probe. No new tool.
13. **Concurrent edits** — last-write-wins. R2 versioning preserves losers; chat surfaces "this file changed since you opened it" via sha mismatch on the proposal.
14. **Images / media** — deferred to cycle 2. Until then: external URLs only (model can paste hotlinks).
15. **Passkey-only writes; passwords and SMS refused.** Cross-device hybrid (phone signs for desktop) and FIDO2 hardware keys cover the "no biometrics on this device" case using standard WebAuthn — no extra code path. Magic-link recovery email enrols a *new* passkey rather than authenticating a write. Multi-key per slug is first-class via `owners_keys`. Paper recovery codes are the last line; if those are also lost, the slug is unrecoverable by design.
16. **API keys exist for automation only.** SDK / CI / scripts can mint long-lived `ONE_API_KEY`s scoped to a slug. The chat UI never exposes them — browsers leak keys too easily.
15. **Agents and skills** — same `write` tool, four kinds (`blog`, `page`, `agents`, `skills`) plus root `agent.md`. Frontmatter contract is `one/agent-spec.md`. Personas selected by `?agent=<name>`; default persona from `agent.md`. No new tool surface.
16. **Compile** — read-only `compile({ agent, target })` tool returns uAgents Python / MCP JSON / SKILL.md as a chat code block. Re-uses `@oneie/sdk/compile`. No signature, no write.
17. **Skill payments** — paid skills gate via x402 micropayment to `owners.wallet`. Owner sets wallet at provision (or later, via a `setWallet` flow). No payment integration in user-land.
18. **Agentverse connection** — set via `/u/<slug>/settings`: paste Agentverse API key once, encrypted at rest in `owners.agentverse_key_enc`. Agents that declare `agentverse: <url>` (or `true`) auto-register on next chat session. BYO key — your agents, your Agentverse account, your reputation.
19. **Site identity** — singleton `site.md` at slug root carries name, tagline, logo, favicon, og, font, nav, social, and the **6 design tokens** (no 7th). `getSlugContext` injects tokens as inline CSS vars on `/u/<slug>/*` only; chat inherits. Body becomes the homepage hero. Same `write` tool, same Face ID.
20. **Media** — `media/<name>` is a new file kind. SVG works in v1 via the existing string `content`; raster (PNG/JPG/WebP) lands cycle 2 through a separate `/api/commit-media` binary endpoint with the same HMAC + assertion contract.
21. **Custom domains** — owner sets host in settings → TXT verify → Worker calls CF API to add Custom Domain → host→slug lookup at the top of the request handler. No per-tenant Worker. Apex requires a CNAME-flattening DNS provider; the settings UI links known-good ones.
22. **Theme is the 6 tokens.** No custom CSS, no component overrides, no themes-as-code. The build kill (`--color-*: initial`) enforces the constraint; arbitrary CSS reintroduces every problem the design system erases.
23. **Analytics on by default.** CF Web Analytics injected by `Layout.astro`; owner opts out via `site.md`. No third-party cookies, no consent banner. Surfaced in `/u/<slug>/settings → Analytics`.
24. **SEO is auto.** `sitemap.xml` and `robots.txt` per slug. Per-page `description` / `og` / `canonical` frontmatter overrides site defaults. JSON-LD (`Article` for blog, `WebSite` for root) emitted automatically.
25. **Domain ↔ slug = 301 by default.** When `domains(host).verified=true`, `/u/<slug>/*` 301s to `https://<host>/*`. Owner toggle: `redirect | mirror | sandbox-only`. Canonical URLs match the redirect target.
26. **Versioning UI = History tab + Restore.** R2 versions surfaced in `/u/<slug>/history/<file>`. Restore writes the old content via the existing `write` flow (one Face ID, no new endpoint).
27. **Export = `.zip` of every R2 object under `<slug>/`.** Owner-gated, streamed. Day-1, not v2. Trust signal.
28. **Notifications = D1 `inbox` + bell + optional webhook.** No platform email for routine notifications. Recovery email transactional only.
29. **Abuse = report button + `abuse@one.ie` + 24h/72h SLA + suspend = 503.** TOS signature captured at provision (`owners.tos_hash`). Free-tier cap: **50MB / 200 files / 10k req·day**, soft-warn at 80%, hard-block at 100%.

---

## Build classifier

| Prior | This |
| --- | --- |
| Spec locked | Yes |
| Variance known | Yes |
| Exit scalar | Yes — "stranger lands, signs, asks for a page, sees it at `/u/<slug>/page/<name>`" |
| Files known | Yes |

**4/4 → `mode: lean`.** One cycle ships modify + provision together; cycle 2 is polish (custom slugs, subdomains, payments, image uploads).

---

*One Worker, many sandboxes. One tool, one signature. R2 is the database. The chat is the CMS.*
