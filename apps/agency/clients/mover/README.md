# Mover — an individual mover, as a ONE node

This is a **fractal client node** for an individual moving company doing local lead-gen on
ONE — the mover counterpart to the roofer knowledge pack. It is the generic **vertical
template**: clone it per real operator, fill in the facts, push.

It's built from three sources:
- the **node shape** of the agency repo (`vespio/ai`, `vespio/data`),
- the **mover niche knowledge** (`../agency-operator/templates/_niches/mover/`, copied into `data/knowledge/`),
- the **lead-gen strategy** (`one-ie/text/leadgen-portfolio.md`, `strategy-decision.md`,
  `strategy-self-optimising-sites.md`) — page → capture → nurture → book → close, per operator,
  at zero marginal cost per city.

The key reframe vs the agency: these agents serve the **mover's own customers** (people moving
house), not agency clients. Every pipeline is the customer's journey.

## Shape

```
mover/
├── _node.toml                 who it is — slug, plan, license fields, agents[]
├── README.md                  this file
├── ai/                        knows
│   ├── context.md             ground truth every agent reads each turn
│   ├── agents/                marketing · sales · service · education · brain
│   ├── workflows/             lead-capture · quote-to-booking · move-day-service · review-referral
│   ├── skills/                quote-estimate · scam-check · rag
│   └── tools/                 _example.toml (GMB, calendar, SMS, email, Stripe)
└── data/                      grows
    ├── services.md            the mover's service menu + 2026 benchmark pricing
    ├── types/move-lead.toml   the lead the funnel captures
    ├── lifecycles/            marketing · sales · service · education stage definitions
    └── knowledge/             mover niche packs (buyer-psychology, tone, trust-signals, regulatory-landmines, qa-fixtures)
```

## The funnel (four departments, one contact)

```
marketing   awareness → interest → consideration → intent          ("movers near me" → quote request)
sales       quote_requested → estimate_booked → quoted → booked     (in-home/video estimate → binding/NTE quote)
service     scheduled → confirmed → move_day → completed → closed    (confirm + COI → move day → CSAT)
education   review_requested → reviewed → referral → repeat          (Google review → referral → next move)
```

Workflows wire them: `lead-capture` → `quote-to-booking` → `move-day-service` → `review-referral`.

## Set it up for a real operator

```bash
cp -r clients/mover clients/<their-slug>
# 1. Edit clients/<their-slug>/_node.toml — name, slug, owner, USDOT/MC, state license, metro, cities
# 2. Edit ai/context.md — replace every {{placeholder}} with their real facts
# 3. Trim data/services.md to the services they actually offer; re-check [VERIFY] prices
one push clients/<their-slug>        # ships agents + skills + workflows to their workspace
```

A real operator, once signed, starts as a bare `_node.toml` in `clients/` — this
template is what fills out its `ai/` + `data/` when it's time to operate it.

## Guardrails (non-negotiable — `data/knowledge/regulatory-landmines.md`)

- No "guaranteed pickup date" (windows only), "lowest price guaranteed", "100% damage-free",
  "no hidden fees" without a published fee list, or "FREE move" in caps.
- Never claim a license without the number. "AMSA certified" is outdated — it's **ProMover**.
- Every interstate quote names the estimate type and offers Full Value Protection.
- Crypto is **not** on this path — a mover is paid in local currency (card/Stripe). Per the
  strategy docs, this is config + content over already-built capabilities: no new engine,
  no `site/` scaffold here — Markdown + TOML only.
