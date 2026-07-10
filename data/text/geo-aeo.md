---
title: AI Citation Patterns (GEO / AEO content layer)
scope: cross-cutting, applies to every page type
source: OO field manual
date: 2026-07-10
status: Round 1 dispatched 2026-07-10 — see "Implementation" section at the end
---

# GEO / AEO: the AI-citation content layer

GEO (Generative Engine Optimisation) / AEO (Answer Engine Optimisation) = making a business the one AI engines cite when answering relevant queries in ChatGPT, Perplexity, and Google AI Overviews. These are the concrete content patterns that earn citations, mapped onto template blocks so the patterns are built into every page by default, not bolted on after.

One honest framing rule up front: AI citation is probabilistic. This layer increases the LIKELIHOOD of citation. Nobody can promise "ranked #1 in AI".

## Why these patterns work

AI answer engines extract and quote text that (a) directly answers a query, (b) is factually unambiguous, and (c) is structurally easy to lift. A wall of prose buries the answer; a designed block surfaces it. Engines also quote CHUNKS, not pages - every answer must read correctly out of context.

## The 6 patterns that earn AI citations

| # | Pattern | What it is | Renders as (block) |
|---|---|---|---|
| 1 | **Direct answer first** | The query answered in 2-3 plain, self-contained sentences at the TOP of the section, before any preamble | direct-answer intro block, FAQ answer |
| 2 | **Entity clarity** | Business name, locations, services, NAP (name, address, phone) stated as unambiguous facts an engine can extract without inference | hero, footer NAP, schema, About credentials |
| 3 | **Structured facts** | Hours, service areas, price ranges, "what's included" as scannable lists and tables, not buried in prose | checklist grid, pricing table, NAP block |
| 4 | **Question then answer** | Real questions (from "People Also Ask" and customer language) answered concisely, each answer self-contained | FAQ accordion + FAQPage schema |
| 5 | **Comparison / specificity** | "Service in city" specifics: routes, neighbourhoods, access, landmarks that prove genuine local presence | local-specifics cards, route cards |
| 6 | **Citations of self** | Consistent NAP and entity facts repeated identically across every page (zero drift), mirrored in schema | site-wide (hero/footer/schema) |

## Mapping the patterns onto page types

| Page type | Primary citation blocks | Patterns carried |
|---|---|---|
| Service page | Direct-answer intro + FAQ | 1, 4 (+ 3 via a "what's included" grid) |
| Location page | Direct-answer local intro + local FAQ + NAP/map block | 1, 4, 5, 6 |
| Homepage | Hero entity block + trust stat band + reviews | 2, 3, 6 |
| About | Story + license/credentials strip | 2 (entity + E-E-A-T) |
| Rates / pricing | Direct-answer pricing intro + pricing FAQ | 1, 3, 4 (cost queries are heavy AI territory) |
| FAQ hub | Direct-answer lead + grouped accordions | 1, 4 (the strongest citation surface on the site) |

## Authoring rules

- **Lead with the answer.** Each direct-answer and FAQ block opens with the answer in plain language, then the supporting detail. Never bury the answer below setup.
- **Self-contained.** Each FAQ answer must read correctly lifted out of context; an engine quotes it alone.
- **Factual and unambiguous.** State NAP, hours, areas, and ranges as facts. No hedging, no marketing fog around the extractable fact.
- **One quotable proof block per money page.** A unique, specific, first-hand factual claim ("2,400 residential moves since 2015, 4.9 stars across 380+ reviews" style) that an engine can lift verbatim and attribute to the entity.
- **NAP/entity consistency is non-negotiable.** The same name, address, phone everywhere, mirrored in schema. Drift kills entity confidence.
- **Two-zone page shape.** A concise answer zone up top (snippet and AI capture), designed-block depth below (classic rankings). The same page serves both.

## Measurement

Snapshot citation presence before and after the patterns land: run the target queries through ChatGPT, Perplexity, and Google AI Overviews on a schedule and log whether the business is mentioned or cited. This is probabilistic, so measure the trend; never promise a position or a timeline.

---

## Implementation — this repo (2026-07-10)

**This document's page-type map is written for a local-service business** (routes, neighbourhoods, NAP, rates pages). This repo (`site/`) is a SaaS/dev-tool starter template with no physical location, no phone number, no service area — patterns 2 and 5 as literally written don't apply. Reframed for this shape before dispatching:

| Local-business concept | This template's equivalent |
|---|---|
| NAP (name, address, phone) | Product/brand identity — name, GitHub repo, license terms, real plugin list. No physical address/phone; don't fabricate one. |
| Service page | The one real product page (`src/pages/products/[slug].astro`) |
| Location page | N/A — no locations, correctly omitted |
| Rates/pricing | `src/pages/products/index.astro` — real price, real "what's included" |
| About / credentials | No real founder bios or testimonials exist in this repo — don't invent them. Real, honest trust signals here are: the license terms, the real plugin list, the real GitHub repo. |

**Verified facts every package below must use, not invent:**
- License: **"ONE License v1.0"** (`/LICENSE`, repo root) — permissive commercial use, one brand-attribution obligation. NOT MIT/Apache — don't call it that.
- Real plugins wired (`site/one.config.ts`): auth, backend, blog, chat, docs, track.
- Real GitHub repo: `https://github.com/one-ie/one`.
- **Only one real product exists** (`src/content/products/own-your-stack.md`, $24.99, real `bullets` already in frontmatter) — a multi-product comparison table would be fabricated; render this one product's real included items instead.
- Real, already-published Lighthouse proof stat (`site/src/pages/speed.astro`): measured 2026-07-09, desktop 100/100/100/100, mobile 76 — reuse this exact, already-verified claim; don't invent a new one.

**Round 1 — dispatched in parallel, disjoint files:**
1. **FAQ hub** (`src/pages/faq.astro`, new) — patterns 1, 2, 4. Real Q&As about the template (what it is, license terms, what's included, deployment, tech stack), `FAQPage` schema, direct-answer intro.
2. **Homepage direct-answer + FAQ excerpt** (`src/pages/index.astro`) — patterns 1, 4, 6. Tightens the existing hero's direct-answer framing, adds a compact real FAQ subset with its own schema, links to the full FAQ hub.
3. **Products page — real structured facts + reused proof** (`src/pages/products/index.astro`) — patterns 3, 6. Renders the one real product's actual bullets as a scannable checklist (not a fabricated comparison table), reuses the real Lighthouse stat as a consistency touchpoint.

Not built, and correctly not built: pattern 5 (comparison/specificity for local presence) has no equivalent in this template's shape.
