# movers-demo — Summit Moving Co. (demo mover node)

> **DEMO / SAMPLE DATA.** Summit Moving Co. (Austin, TX), its owner Marcus Hill, the
> (512) 555-0142 phone, and the USDOT / MC / TxDMV numbers are **fictional** — invented to
> show what a fully-configured mover node looks like. **Do not `one push` this to a live
> workspace or point a real domain at it.** For a real operator, clone the template
> (`../mover/`) instead and fill in their real facts.

This is a **fractal client node** (child of `vespio`) for an individual moving company doing
local lead-gen on ONE — the concrete, fully-filled worked example of the `mover` template.
Where `../mover/` carries `{{placeholders}}`, this node has real-looking demo values so you
can read, demo, and test the whole funnel end to end.

Built from three sources:
- the **node shape** of the agency repo (`vespio/ai`, `vespio/data`),
- the **mover niche knowledge** (`../../../agency-operator/templates/_niches/mover/`, copied into `data/knowledge/`),
- the **lead-gen strategy** (`one-ie/text/leadgen.md`, `strategy-decision.md`,
  `strategy-self-optimising-sites.md`) — movers are the spearhead vertical; page → capture →
  nurture → book → close, per operator, at zero marginal cost per city.

The key reframe vs the agency: these agents serve the **mover's own customers** (people moving
house), not agency clients. Every pipeline is the customer's journey.

## The demo operator

| Field | Value (fictional) |
|---|---|
| Company | Summit Moving Co. |
| Metro | Austin, TX (+ Round Rock, Cedar Park, Pflugerville, Georgetown, San Marcos, Kyle, Buda, Leander, Hutto) |
| Owner | Marcus Hill |
| Phone | (512) 555-0142 |
| USDOT / MC | 3987654 / 1456789 (interstate) |
| State license | TxDMV 006789 (Texas intrastate) |
| Founded | 2016 · "4,000+ moves" |

## Shape

```
movers-demo/
├── _node.toml                 who it is — slug, plan, license fields, agents[]
├── README.md                  this file
├── ai/                        knows
│   ├── context.md             ground truth every agent reads each turn (filled, demo data)
│   ├── agents/                marketing · sales · service · education · analytics · brain
│   ├── workflows/             lead-capture · quote-to-booking · move-day-service · review-referral
│   │                          · re-nurture · campaign-seasonal · b2b-partnerships
│   ├── skills/                quote-estimate · scam-check · rag
│   └── tools/                 _example.toml (GMB, calendar, SMS, email, Stripe)
└── data/                      grows
    ├── services.md            the mover's service menu + 2026 benchmark pricing
    ├── types/move-lead.toml   the lead the funnel captures (+ utm/partner attribution)
    ├── lifecycles/            marketing · sales · service · education stage definitions
    ├── funnels/               acquisition.toml — unified funnel, conversion targets, leak points
    ├── analytics/             kpis.toml — 9 KPIs (targets + floors) + source attribution
    ├── campaigns/             summer-2026/ — filled campaign pack (manifest + hooks/ads/email/GMB/landing)
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
Growth + recovery sit alongside: `re-nurture` (recover lost leads at +30d), `campaign-seasonal`
(fill the summer peak), `b2b-partnerships` (apartment + RE-agent referral network). An `analytics`
agent measures the whole funnel against `data/analytics/kpis.toml` and `data/funnels/acquisition.toml`.

## Turn this demo into a real operator

```bash
cp -r clients/mover clients/<their-slug>     # start from the TEMPLATE, not this demo
# 1. Edit clients/<their-slug>/_node.toml — name, slug, owner, USDOT/MC, state license, metro, cities
# 2. Edit ai/context.md — replace every {{placeholder}} with their real facts
# 3. Trim data/services.md to the services they actually offer; re-check [VERIFY] prices
one push clients/<their-slug>                # ships agents + skills + workflows to their workspace
```

A real operator, once signed, starts as a bare `_node.toml` in `clients/` — the
`mover` template is what fills out its `ai/` + `data/` when it's time to operate it.

## Guardrails (non-negotiable — `data/knowledge/regulatory-landmines.md`)

- No "guaranteed pickup date" (windows only), "lowest price guaranteed", "100% damage-free",
  "no hidden fees" without a published fee list, or "FREE move" in caps.
- Never claim a license without the number. "AMSA certified" is outdated — it's **ProMover**.
- Every interstate quote names the estimate type and offers Full Value Protection.
- Crypto is **not** on this path — a mover is paid in local currency (card/Stripe). Per the
  strategy docs, this is config + content over already-built capabilities: no new engine,
  no `site/` scaffold here — Markdown + TOML only.
