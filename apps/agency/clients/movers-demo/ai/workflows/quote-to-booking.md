---
id: quote-to-booking
label: Quote Request → Booked Move
description: Runs on a quote request. Books the in-home/video estimate, prepares a binding/not-to-exceed quote, follows up, and books the move. Fires move-day-service on booking.
trigger: lifecycle:sales:quote_requested
department: sales
---

# Quote Request → Booked Move

**Goal:** Turn a quote request into a booked move with a binding or not-to-exceed estimate in
writing. The estimate (in-home or video) is the conversion lever — get it scheduled fast.

## Steps

### 1. Immediate — Book the estimate (agent)

`sales` agent responds in minutes, pushes the **video or in-home estimate**, and books it.
On scheduled:

```
receiver: entity:tag
args:
  id: "{{ contact.id }}"
  remove: ["lifecycle:sales:quote_requested"]
  add: ["lifecycle:sales:estimate_booked"]
```

### 2. After the estimate — Prepare the quote (skill)

```
receiver: skill:run
args:
  skill: quote-estimate
  input:
    home_size: "{{ contact.home_size }}"
    move_type: "{{ contact.move_type }}"     # local | long-distance | intrastate
    from_zip: "{{ contact.from_zip }}"
    to_zip: "{{ contact.to_zip }}"
    add_ons: "{{ contact.add_ons }}"          # packing | storage | specialty
```

Always name the **estimate type** (binding / non-binding / not-to-exceed) and state what's
included, the released-value default, and the Full Value Protection upsell. Then:

```
receiver: entity:tag
args:
  id: "{{ contact.id }}"
  add: ["lifecycle:sales:quoted"]
```

### 3. Send the written quote (tool)

```
receiver: space:post
args:
  group: contact:{{ contact.id }}
  content: |
    Hi {{ contact.name }}, here's your written estimate for the {{ contact.move_date }} move.

    Type: {{ quote.estimate_type }} — the number we quote is the number you pay.
    Total: {{ quote.total }}  ·  Includes: {{ quote.included }}
    Valuation: released value ($0.60/lb) included · Full Value Protection available at {{ quote.fvp_rate }}.

    USDOT 3987654 / MC 1456789 — verify us on FMCSA SAFER anytime.
    Ready to lock your date? Reply BOOK or call (512) 555-0142.
```

### 4. Day 2 — Follow up (agent)

If not booked, `sales` agent follows up once, answering the most likely objection
(hostage-loading / higher-than-other-guy / deposit) with the scripts in the agent file.

### 5. Booked or lost (condition)

- BOOKED → `entity:tag(add: ["lifecycle:sales:booked"])` → `mark("move:booked")`
  (fires `move-day-service`).
- LOST → `entity:tag(add: ["lifecycle:sales:lost"])`, tag reason
  (`price | timing | competitor | not_qualified`), re-nurture in 30 days.

### 6. Specialty / guarantee — escalate (human gate)

```
receiver: human:ask
args:
  assignee: "{{ owner }}"
  prompt: "Specialty or guarantee request on {{ contact.name }}'s quote: {{ detail }}. Confirm pricing/terms."
```

## Signals

- Entry: `lifecycle:sales:quote_requested`
- Estimate booked: `lifecycle:sales:estimate_booked`
- Quoted: `lifecycle:sales:quoted`
- Exit (success): `lifecycle:sales:booked` → `mark("move:booked")`
- Exit (lost): `lifecycle:sales:lost`
