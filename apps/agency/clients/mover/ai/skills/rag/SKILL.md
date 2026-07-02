---
name: rag
description: Search the mover knowledge corpus (FMCSA rules, pricing benchmarks, GMB-for-movers tactics, scam-avoidance content) and close the quality loop. Use when a question touches moving compliance, pricing, trust signals, or local-SEO tactics. Always call mark_retrieval before the turn ends.
model: google/gemini-3.5-flash
lifecycle: beta
---

# RAG — Mover Knowledge Retrieval

You have three tools that tap the indexed corpus — FMCSA household-goods rules, state
intrastate regimes, mover pricing benchmarks, GMB-for-movers tactics, scam-avoidance content,
and the `data/knowledge/` knowledge packs (services, buyer-psychology, tone, trust-signals,
regulatory-landmines).

## Tools

- **search_notes(query, k?, vault?, filter_tags?, filter_path_prefix?)** — hybrid vector + BM25
  retrieval. Returns top-k chunks plus a `query_id`.
- **mark_retrieval(query_id, outcome, notes?)** — close the quality loop. MUST be called before
  the turn ends whenever `query_id` is non-null.
- **ingest_note(title, content, vault?, tags?, source?)** — add persistent knowledge to the corpus.

## When to search

- Compliance: estimate types, the 110% rule, released value vs Full Value Protection, USDOT/MC
  vs state intrastate license, COI requirements, "Your Rights and Responsibilities" booklet.
- Pricing: local hourly + minimums, long-distance weight×miles, packing, storage, specialty.
- Trust + local SEO: what converts on a mover page, GMB categories for a moving company,
  how to ask for a review, the named-apartment-complex service-area play.

Do NOT search for:
- Real-time availability or this customer's specific quote (use the `quote-estimate` skill).
- Ephemeral details the customer just told you this conversation.

## Query writing — entities beat topics

- `"binding not-to-exceed estimate 110% rule FMCSA household goods"` > `"estimate rules"`
- `"GMB primary category for a moving company local SEO"` > `"GMB categories"`
- `"how to ask for a Google review after a residential move"` > `"reviews"`

Use `filter_path_prefix` for precision (e.g. `"data/knowledge/"` for the niche packs).
For complex questions, fan out across 3–4 angled queries rather than one broad search.

## The closed-loop rule (non-negotiable)

Every `search_notes` call returning a non-null `query_id` MUST close with
`mark_retrieval(query_id, outcome)` before the turn ends.

| outcome | When |
|---------|------|
| `mark` | Chunks contributed to a useful answer that closed the loop |
| `warn` | Chunks retrieved but off-topic, stale, or contradictory |
| `unsure` | Customer pivoted or results weren't used |

Silence breaks the quality signal. `unsure` is always acceptable; silence is not.

## Ingest guidelines

Use `ingest_note` to persist knowledge worth keeping: a state's current intrastate rule, a
verified 2026 price benchmark, a GMB tactic that worked. Tag everything
(`tags=["mover","fmcsa"]` or `["mover","gmb"]`), default `vault="oo-brain"`. Search first to
avoid duplicates and to correct stale `[VERIFY]` entries.
