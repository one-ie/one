---
id: re-nurture
label: Cold Lead Re-Nurture (30-day)
description: Fires 30 days after a lead goes cold (lost sale, no-reply, or consideration stall). Proof-stacks, addresses the likely objection, and offers a fresh estimate. One shot — not a drip campaign.
trigger: lifecycle:sales:lost
department: marketing
delay_days: 30
---

# Cold Lead Re-Nurture (30-day)

**Goal:** Re-enter leads who stalled or chose a competitor. One well-timed, proof-heavy message
beats a 10-email drip — movers are often still researching at day 30, especially for a planned move.
The message addresses the most likely reason they didn't book and offers a fresh start.

## Guard (condition)

- Only run if `lifecycle:sales:lost` OR `lifecycle:marketing:consideration` is active AND
  no new `lifecycle:sales:*` tag has appeared since tagging.
- Skip if `retention:risk` is set (unhappy customer — this is not a re-sell, it's a retention issue).
- Skip if move date has already passed.

## Steps

### 1. Day 30 — Check move window (condition)

```
receiver: signal
args:
  receiver: logic:eval
  expr: "contact.move_date > today + 14"
```

- Move date ≥ 2 weeks out → proceed.
- Move date < 2 weeks out → skip (too late to be useful).

### 2. Proof-stack message (agent)

`marketing` agent drafts a single message tailored to the reason tagged at loss:

| Loss reason | Message angle |
|---|---|
| `price` | "Here's exactly what our quote covers — and what it doesn't. No hostage loading." |
| `competitor` | "Happy to be a second opinion. We'll beat any binding quote from a licensed carrier." |
| `timing` | "Still in the planning stage? We block dates up to 90 days out." |
| `not_qualified` | Skip — do not re-engage. |

All messages lead with the same trust block:

```
receiver: space:post
args:
  group: contact:{{ contact.id }}
  content: |
    Hi {{ contact.name }} — checking back on your {{ contact.move_date | date: "%B" }} move.

    A few things that may help if you're still deciding:

    ✔ {{ review_count }}+ Google reviews ({{ rating }} avg) — verify on SAFER anytime.
    ✔ USDOT 3987654 / MC 1456789 — federally licensed and insured.
    ✔ We give you the estimate type in writing before you commit: binding or not-to-exceed.
      The number we quote is the number you pay.

    {{ objection_line }}

    If you'd like a fresh estimate (no obligation): {{ estimate_link }}
    Or reply here — a human reads every message.

    — Marcus · Summit Movers · (512) 555-0142
```

### 3. Tag re-entry (tool)

```
receiver: entity:tag
args:
  id: "{{ contact.id }}"
  remove: ["lifecycle:sales:lost"]
  add: ["lifecycle:marketing:consideration"]
```

### 4. Day 32 — One follow-up (condition + tool)

If no reply or click within 48h, send one final short message:

```
Still moving in {{ contact.move_date | date: "%B" }}? Our calendar for that month is filling.
Two minutes to lock a video estimate: {{ estimate_link }}
```

### 5. Close or recycle (condition)

- Reply or click → re-enter `lead-capture` at step 2 (skip the immediate acknowledge; they
  already know us).
- No response → `entity:tag(add: ["lifecycle:marketing:awareness"])`. Remove from active nurture.
  Note next-likely-move window if known (lease renewal, "buying in a year").

## Signals

- Entry: `lifecycle:sales:lost` (fired by `quote-to-booking`) after `delay_days: 30`
- Re-entry (success): `lifecycle:sales:quote_requested`
- Re-entry (cold): `lifecycle:marketing:awareness`

## Notes

- **One proof-heavy message outperforms a 10-email drip** for movers. The research window
  is short; if they're still shopping at day 30 they want certainty, not more emails.
- Never offer a discount — it signals the first quote was inflated (the #1 scam signal).
  Offer clarity and a fresh estimate instead.
- Frequency matters: doubling sends inside an active campaign lifts revenue ~50%; but a
  re-nurture is not a campaign. One message + one follow-up is the limit.
