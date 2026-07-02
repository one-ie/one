---
id: review-referral
label: Completed → Review → Referral
description: Runs on a happy, closed move (CSAT ≥ 4 only). Asks for a Google review, then a referral, then tags the customer for the next move. The review is the asset a one-shot service compounds.
trigger: lifecycle:service:completed
department: education
---

# Completed → Review → Referral

**Goal:** Convert one clean move into the two assets that compound for a lead-gen mover — a
Google review (the #1 trust signal that lifts every future page) and a referral. Only runs for
customers who closed happy; an unhappy customer never sees a review ask.

## Guard — happy only (condition)

Entry requires `lifecycle:service:closed` with CSAT ≥ 4. If `retention:risk` is set, **stop** —
do not ask. The `move-day-service` workflow enforces this; re-check here.

## Steps

### 1. Within 24h — Review ask (tool)

```
receiver: space:post
args:
  group: contact:{{ contact.id }}
  content: |
    Hi {{ contact.name }} — glad your move went well 🎉

    The single biggest help you can give a small local mover: a quick Google review.
    30 seconds, and it helps the next family find an honest crew.
    → {{ google_review_link }}

    If anything wasn't perfect, reply here first — we'd rather fix it.
```

```
receiver: entity:tag
args:
  id: "{{ contact.id }}"
  add: ["lifecycle:education:review_requested"]
```

### 2. Day 3 — One nudge (tool, condition)

If no review detected, send **one** gentle reminder. Then stop — never badger.

### 3. On review — Referral ask (agent)

When a review lands or the customer replies happy → `lifecycle:education:reviewed`, then:

```
receiver: space:post
args:
  group: contact:{{ contact.id }}
  content: |
    Thank you for the review — it genuinely matters to a small crew.

    Know anyone else moving soon? Send them our way — we'll take great care of them.
    {{ referral_link }}
```

Tag `lifecycle:education:referral`. If they name someone → create a lead, notify `sales`.

### 4. Tag for repeat (tool)

```
receiver: entity:tag
args:
  id: "{{ contact.id }}"
  add: ["lifecycle:education:repeat"]
```

Note next-likely-move window (lease end, "buying in a year"). A light check-in then beats a cold ad.

## Rules

- **Never** ask an unhappy customer for a review (manufactures a 1-star).
- **Never** offer payment for a review (violates Google policy). Thank, don't bribe.
- One ask per message; keep it human and short.

## Signals

- Entry: `lifecycle:service:completed` (CSAT ≥ 4)
- review_requested → reviewed → referral → repeat
- Lead created on a named referral → `lifecycle:sales:quote_requested`
