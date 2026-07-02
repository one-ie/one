---
id: lead-capture
label: Lead Capture → Quote Request
description: Runs when a visitor shows interest (city page, click, call). Acknowledges within 5 minutes, pushes the in-home/video estimate, and hands a quote request to sales.
trigger: lifecycle:marketing:interest
department: marketing
---

# Lead Capture → Quote Request

**Goal:** Catch a "movers near me" lead while it's hot and convert the interest into a quote
request within minutes. Speed is the whole game — a human answering (or an instant agent reply)
is the biggest drop-off point for last-minute movers.

## Steps

### 1. Immediate — Acknowledge (tool, < 5 min)

```
receiver: space:post
args:
  group: contact:{{ contact.id }}
  content: |
    Hi {{ contact.name }},

    Thanks for reaching out about your {{ contact.move_type | default: "move" }} in {{ contact.city }}.

    Quickest way to a real number: a 15-minute video walkthrough (or in-home estimate).
    We'll give you a binding or not-to-exceed quote in writing — no surprises on move day.

    Book here: {{ estimate_link }}
    Or call {{ phone }} — a human answers.

    — {{Company}} Movers · USDOT {{usdot}} / MC {{mc}}
```

### 2. Capture the short form (tool)

Collect only: name · phone · move date · from zip · to zip · home size. Never a 15-field form.
On submit → tag and hand to sales:

```
receiver: entity:tag
args:
  id: "{{ contact.id }}"
  remove: ["lifecycle:marketing:intent"]
  add: ["lifecycle:sales:quote_requested"]
```

### 3. Day 1 — Proof nudge (agent)

If no estimate booked within 24h, `marketing` agent sends a proof message: real review count,
USDOT/MC clickable to SAFER, named owner, "{{N}}+ moves since {{Founded}}". One CTA: book the estimate.

### 4. Day 3 — Availability nudge (tool)

If still no booking:

```
Still planning your {{ contact.move_date }} move? Our calendar for that week is filling up.
Lock your estimate slot: {{ estimate_link }}
```

### 5. Day 5 — Move or close (condition)

- IF estimate booked → already handed to sales at step 2; exit.
- IF no response → `entity:tag` → `lifecycle:marketing:consideration` (re-enter nurture in 30 days).

## Signals

- Entry: `lifecycle:marketing:interest`
- Exit (success): `lifecycle:sales:quote_requested`
- Exit (timeout): `lifecycle:marketing:consideration`

## Notes

- Never write "guaranteed pickup date", "lowest price guaranteed", or "FREE move" — FMCSA/spam
  landmines (`data/knowledge/regulatory-landmines.md`).
- The whole funnel runs at zero marginal cost per city — this is the lead-gen wedge in
  `one-ie/text/leadgen-portfolio.md` made concrete for one operator.
