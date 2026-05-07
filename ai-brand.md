# ai-brand.md — Create your AI brand

**Goal:** an agency, company, or solo operator stands up their own AI brand
on ONE — own domain, own theme, own agents, own skills, own pricing —
without running infrastructure. The substrate is shared; what you ship is
yours.

```
                  one substrate, N brands
                  ──────────────────────────
   acme.com            studio.partner.io          you.one.ie
   ╔══════════╗        ╔══════════╗               ╔══════════╗
   ║ AcmeBot  ║        ║ Studio   ║               ║ MyBrand  ║
   ║ blue/red ║        ║ pink/jet ║               ║ defaults ║
   ║ 12 skills║        ║ 4 skills ║               ║ 1 skill  ║
   ╚════╤═════╝        ╚════╤═════╝               ╚════╤═════╝
        │                   │                          │
        └──────── api.one.ie · TypeDB · WsHub ─────────┘
                       (one brain, many faces)
```

A "brand" is a **Group** in the 6-dimension substrate (`one/dictionary.md`).
Everything else hangs off it: actors (your agents), things (your skills,
themes), paths (which agent learned which task on your domain), events
(payments earned by your brand), learning (hypotheses about your users).
The schema doesn't grow — the brand is just another Group.

---

## What you brand (six surfaces)

| Surface | What you control | Lives in |
| --- | --- | --- |
| **Domain** | `you.one.ie` subdomain, or a custom apex (`brand.com` via CNAME + verify) | `web/src/middleware.ts:55-72` · `web/src/pages/api/domains/[domain]/verify.ts` |
| **Theme** | 6 design tokens (background, foreground, font, primary, secondary, tertiary) — see `.claude/rules/design.md` | `web/src/pages/api/themes/index.ts` · `web/src/pages/api/themes/[id].ts` |
| **Agents** | Your roster — names, system prompts, models, capabilities | `web/src/pages/api/agents/index.ts` · `agents/templates/` |
| **Skills** | Tool packs your agents can call — yours, imported, or composed | `web/src/pages/api/skills/index.ts` · `cli/` (`skill new/import/publish`) |
| **Chat surface** | Branded `/chat` (the one users land on) — same engine, your shell | `web/src/pages/chat.astro` · `web/src/components/Chat.tsx` |
| **Commerce** | Your prices, your payout wallet, your x402 quotes | `pay.one.ie` · `x402.md` · `wallet.md` |

That's the whole product. No new schema, no new runtime — every piece
already exists on the substrate. The brand is the packaging.

---

## How a brand resolves (request-path)

```
GET https://acme.com/sales/quote
        │
        ▼
  middleware.ts
        │
        ├── host = "acme.com"        not primary, not *.one.ie subdomain
        ├── D1: SELECT slug FROM domains WHERE host=? AND verified=1
        │     → slug = "acme"
        ├── ctx.locals.workspaceContext = { workspace:"acme", brand:"acme",
        │                                   agent:"sales", viewer:"end_user" }
        └── rewrite → /u/acme/sales/quote
                        │
                        ▼
                  Astro page renders with the brand's theme,
                  the brand's agent, the brand's skills.
```

The whole resolver is ~25 lines (`web/src/middleware.ts:55-72`). One D1
lookup, no per-request config fetch — the workspace context flows through
`Astro.locals` into every page and API route.

---

## Lifecycle (5 states)

```
   discover   →   provision   →   configure   →   publish   →   operate
   ─────────────────────────────────────────────────────────────────────
   land on    sign in with    pick agents,    point your    earn, learn,
   one.ie     passkey →       skills, theme   domain at     evolve. paths
              brand=auto      at /settings    one.ie + add  strengthen.
              ({user}.one.ie)                 TXT/CNAME →   prompts
                                              /api/domains  rewrite
                                              /[domain]/    every 10 min
                                              verify        (L5).
```

Each transition is a normal substrate signal — `ui:settings:save`,
`ui:domain:verify`, etc. — so brand setup itself learns from usage.
Stuck users emit `warn`s; smooth flows emit `mark`s. The lifecycle gets
faster every cycle by construction.

---

## What a brand owns (data model)

A Group entity in TypeDB with these direct relations:

```
brand "acme"
  ├── owns →  agent  (sales, support, onboard)            [Actor]
  ├── owns →  skill  (gmail-quote, stripe-refund)          [Thing]
  ├── owns →  theme  (acme-light, acme-dark)               [Thing]
  ├── owns →  domain (acme.com, www.acme.com)              [Thing]
  ├── earns ←  payment-event                               [Event]
  └── learns →  hypothesis (sales-tag→quote-skill 0.87)    [Learning]
```

No new dimensions — every arrow above is one of the locked 6 (`Groups,
Actors, Things, Paths, Events, Learning`). A brand is a tenancy lens, not
a parallel ontology.

**Isolation:** signals stay inside the brand's group by default — an
agent on `acme.com` never sees `studio.partner.io`'s pheromone unless
the operator explicitly publishes a skill or hypothesis. This is the
same `Group` boundary that keeps World A's path strengths from leaking
into World B's; brands inherit it for free.

---

## Surfaces a brand inherits (no extra build)

Once a brand exists, every surface in `website.md` automatically renders
with their theme, agent roster, and skill catalogue:

| Route | What the brand gets |
| --- | --- |
| `/chat` | Their agent answers, their skills run, their theme paints the shell |
| `/buy` | Storefront listing the brand's offers; quotes signed by their wallet |
| `/sell` | Their authoring surface — list things, set prices, receive x402 |
| `/wallet` | The brand's treasury (operator-controlled), distinct from end-user wallets |
| `/u/{slug}` | Public profile / link-in-bio for the brand |

There's no per-surface theming code — the design system enforces 6 tokens
(`.claude/rules/design.md`), so swapping a brand is a `--color-*`
substitution at the layout root. CSS does the rest.

---

## What an agency builds (composition)

An agency is just a brand whose **things include other brands' agents
and skills**. They take a published skill from `nanoclaw.dev`, compose
it with two of their own, wrap it under their theme, and resell it:

```
agency-brand "studio"
  ├── owns → skill "studio.intake"     (their own)
  ├── imports → skill "gmail.send"     (substrate skill, royalty path)
  └── owns → agent "studio.concierge"
              ├── uses skill: studio.intake
              ├── uses skill: gmail.send       → royalty to skill author
              └── uses skill: composio:slack   → fallback (composio.md)
```

When the agency's agent calls an imported skill, **two paths get
marked**: the agency's own consumption path *and* the path back to the
skill author. The author's pheromone strengthens; their next price tick
reflects the demand. Royalties piggyback on the substrate's existing
edge accounting — see `x402.md` for the payment wire and
`one/lifecycle.md` L4 (economic loop) for how this compounds.

---

## Who pays whom

```
end-user ──pays──► brand wallet     (x402, settled per response)
                    │
                    ├── ONE platform fee  (small %)
                    ├── skill royalty     (if imported)
                    └── brand operator    (the rest)
```

Every settlement is one x402 envelope (`x402.md`) with multiple
beneficiaries — no off-ledger reconciliation. The platform fee, the
skill royalty, and the operator share are all addresses on the same
signed quote. If the user never pays, no one gets anything; if they pay
once, everyone is paid atomically.

---

## Threat model

| Risk | What we defend | What we accept |
| --- | --- | --- |
| Brand A reads brand B's data | Group-scoped TypeDB queries; middleware sets `workspace` from verified host only | A misconfigured custom domain pointing at the wrong slug returns the wrong brand — verification (TXT challenge) is mandatory before activation |
| Brand impersonates ONE | Custom-domain UX shows the brand chrome only; we never claim "official ONE" inside a brand surface | Operators can put "Powered by ONE" wherever they like — that's expected |
| Skill author drains revenue | Royalty is a beneficiary line in the same x402 quote that pays the operator — atomic or nothing | An operator who hard-forks the skill code into their own brand cuts the royalty; we mitigate by skill identity living in TypeDB (paths track usage), not by DRM |
| End-user signs a tx for the wrong brand | The signing surface always shows the brand chrome that requested it; passkey prompts include `relying party = host` (`passkeys.md`) | A user who ignores the chrome and rubber-stamps every prompt loses the protection — biometric is non-transferable, but attention isn't |
| Custom-domain takeover (CNAME left dangling) | `domains` table requires verified=1 (TXT challenge) before resolving; quarterly verification tick (`mac.md` motif) | If a brand stops paying their DNS bill, their domain expires — same as any web property |

---

## What's shipped

- ✅ Subdomain resolver (`web/src/middleware.ts:55-72`) — `{slug}.one.ie` works today
- ✅ Custom-domain verify endpoint (`web/src/pages/api/domains/[domain]/verify.ts`)
- ✅ `domains` table in D1 with `host`, `slug`, `verified`
- ✅ Themes API + 6-token design system (`.claude/rules/design.md`, `web/src/pages/api/themes/`)
- ✅ Agents API (`web/src/pages/api/agents/index.ts`)
- ✅ Skills API + import/publish via CLI (`web/src/pages/api/skills/`, `cli/src/index.ts` `skill` verb)
- ✅ Workspace-scoped middleware context (`workspaceContext` on `Astro.locals`)

## What's not (the brand-product gap)

- ⏳ **Brand provisioning UI** — the `/settings` flow that wires domain + theme + roster + payout wallet end-to-end with a single passkey approval
- ⏳ **Royalty splitting in x402 quotes** — the wire format supports multiple beneficiaries; the quote builder doesn't yet emit them automatically when an imported skill runs
- ⏳ **Brand-scoped pheromone isolation** — currently paths are global per actor; the Group boundary needs to be a query filter on `mark`/`warn`/`select`
- ⏳ **Public brand directory** — `/u` lists users, not brands
- ⏳ **"Powered by ONE" attribution rules** — voluntary today; no enforcement, no badge tier

---

## See also

- [`website.md`](website.md) — the 5 routes a brand inherits
- [`chat.md`](chat.md) — branded `/chat` surface details
- [`x402.md`](x402.md) — multi-beneficiary settlement (royalties)
- [`wallet.md`](wallet.md) — payout wallets
- [`agents.md`](agents.md) — the four human↔agent patterns inside a brand
- [`composio.md`](composio.md) — BYO-accounts (each brand's users connect their own Gmail/Slack/etc)
- [`one/dictionary.md`](one/dictionary.md) — Group, Actor, Thing definitions
- `.claude/rules/design.md` — the 6 tokens a brand can override
- `web/src/middleware.ts` — host → workspace resolver

---

*Six tokens. One domain. N agents, M skills. The substrate is shared; the brand is yours.*
