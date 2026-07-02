---
id: move-day-service
label: Booked → Move Day → Completed
description: Runs on a booked move. Confirms, files COI, runs move-day comms, handles any claim, and closes with CSAT. Fires review-referral on a happy completion.
trigger: lifecycle:sales:booked
department: service
---

# Booked → Move Day → Completed

**Goal:** Make a high-stress move boring and predictable — confirmed, COI filed, crew on time
(within the window), and closed with a CSAT. A clean move is what earns the review.

## Steps

### 1. Within the hour — Confirm (tool)

```
receiver: space:post
args:
  group: contact:{{ contact.id }}
  content: |
    Hi {{ contact.name }}, your move is locked in 🚚

    📅 {{ contact.move_date }} · crew arrives between {{ contact.window }}
    💵 {{ quote.estimate_type }} estimate: {{ quote.total }}
    USDOT 3987654 / MC 1456789

    Before move day: {{ checklist_link }}
    Building need a COI? Reply and we'll file it within 48 hours.
```

```
receiver: entity:tag
args:
  id: "{{ contact.id }}"
  add: ["lifecycle:service:scheduled"]
```

### 2. If apartment / commercial — File COI (tool + condition)

If origin or destination is a managed building, collect the building's insurance requirements
and file the COI naming the building as additional insured (24–48h turnaround). Move to `confirmed`.

### 3. 24–48h before — Re-confirm (tool)

Short reminder: arrival window, what to have ready, contact number. Move to `confirmed`.

### 4. Move day (agent)

`service` agent confirms dispatch + arrival window and stays reachable.
- A blocked/delayed move is `p1`:

```
receiver: human:ask
args:
  assignee: "{{ owner }}"
  priority: urgent
  prompt: "P1 move-day issue for {{ contact.name }}: {{ summary }}. Reply when handled."
```

- On completion → `entity:tag(add: ["lifecycle:service:completed"])`, `mark("move:completed")`.

### 5. Claim? (condition + human gate)

If damage is reported: acknowledge in 24h, classify coverage (released value vs Full Value
Protection), gather photos + high-value inventory, then escalate — never promise a settlement:

```
receiver: human:ask
args:
  assignee: "{{ owner }}"
  prompt: "Damage claim for {{ contact.name }}: {{ summary }}. Coverage: {{ coverage }}. Filed for review."
```

### 6. CSAT + close (tool + condition)

```
receiver: space:post
args:
  group: contact:{{ contact.id }}
  content: |
    Your move is done — thanks for trusting us with it.
    How did we do? (1–5): {{ csat_link }}
```

- CSAT ≥ 4 → `lifecycle:service:closed` → fires `review-referral`.
- CSAT < 4 → tag `retention:risk`, `human:ask({{ owner }}, "Unhappy customer {{ contact.name }} scored {{ score }} — call before any review ask.")`. Do **not** trigger review-referral.

## Signals

- Entry: `lifecycle:sales:booked`
- Scheduled → confirmed → move_day → completed (`mark("move:completed")`)
- Exit (happy): `lifecycle:service:closed` → `review-referral`
- Exit (risk): `retention:risk` + `human:ask`
