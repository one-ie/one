---
id: b2b-partnerships
label: B2B Partnership Outreach (Apt Complexes + RE Agents)
description: Reciprocal-framed cold outreach to apartment complex managers and real estate agents in Summit Movers' metro. Targets warm-intro lead flow — lower volume, higher close rate than paid ads. Runs once per quarter per city.
trigger: manual
department: marketing
cadence: quarterly_per_city
---

# B2B Partnership Outreach

**Goal:** Build a referral network with apartment complex managers and real estate agents who
see movers every week. The framing is **reciprocal** — "access to your residents + reciprocal
referrals" — not a cold pitch. Research shows this angle achieves 5%+ reply rates when
targeting is tight.

## Target profiles

### Track A — Apartment complexes

High-propensity targets: complexes with 50+ units, high lease-turnover neighbourhoods,
properties that require COI (Summit already files these — it's a trust signal, not a burden).

Ideal contact: leasing manager or property manager (named — never "To whom it may concern").

### Track B — Real estate agents

Targets: agents who closed 10+ deals in the target city in the last 12 months (pull from
public MLS data or Zillow agent pages). Focus on relocation specialists first.

## Phase 1 — Build the prospect list (tool + human)

```
receiver: human:ask
args:
  assignee: "{{ owner }}"
  prompt: |
    B2B outreach list for {{ city }} — confirm 20 targets before we send.

    Track A (apartment complexes): 10 properties, 50+ units, high-turnover area.
      [Attach or paste the list]

    Track B (real estate agents): 10 agents, 10+ deals in {{ city }} last 12 months.
      [Attach or paste the list]

    For each: name, role, email, building/office name. We personalise every message.
```

## Phase 2 — Personalised outreach (agent)

`marketing` agent drafts one message per contact. Never a template blast.

### Track A — Apartment complex message

```
Subject: Summit Movers + {{ building_name }} — resident moving days

Hi {{ contact.name }},

I'm Marcus from Summit Movers — we've handled moves for residents at [nearby complex or area]
and we're expanding our partnership network in {{ city }}.

What we offer property managers:
  · Same-day COI naming your building as additional insured — we already file these routinely.
  · A direct line for residents (not a call centre): (512) 555-0142.
  · We refer residents looking for apartments to local partners we trust.

No cost to you or your residents. If it's a fit, we're happy to be your go-to mover for
new leases and move-outs.

Worth a 15-minute call?
— Marcus Hill, Summit Movers · USDOT 3987654 / MC 1456789
```

### Track B — Real estate agent message

```
Subject: Moving referrals for your clients — Summit Movers (Austin)

Hi {{ contact.name }},

I'm Marcus from Summit Movers. I've noticed your closings in {{ city }} — congratulations
on a strong run.

A lot of your buyers and sellers need a mover they can trust at the worst moment of their
transaction. We offer:
  · Binding or not-to-exceed written estimates (no hostage loading).
  · USDOT 3987654 / MC 1456789 — federally licensed, insured.
  · {{ review_count }}+ Google reviews since 2016.

We'd refer clients who need an agent in {{ city }} to you in return.

Happy to jump on a quick call and see if it's a fit.
— Marcus Hill, Summit Movers · (512) 555-0142
```

### Sending cadence

Send 5 per day maximum (one per city cluster). Personalise each — never a merge-tag blast.
Track reply rate per track; stop Track A or B independently if reply rate < 2% after 20 sends.

## Phase 3 — Air cover: event sequences (tool)

When a target city has an upcoming trade show, apartment expo, or real estate conference
(2–4 weeks out), run a short "air cover" sequence to high-propensity contacts:

```
Day –14: The personalised intro message (Phase 2)
Day –7:  Brief follow-up — "We'll be around [event] week — happy to connect briefly."
Day –2:  "See you at [event]? We're the guys with the red Summit Movers shirts."
```

Air cover converts booth/conference spend from passive to deliberate pipeline. Map this
against the seasonal campaign calendar — they compound.

## Phase 4 — Partnership onboarded (human gate + tool)

When a partner says yes:

```
receiver: human:ask
args:
  assignee: "{{ owner }}"
  prompt: |
    New B2B partner confirmed: {{ contact.name }} at {{ building_or_office }}, {{ city }}.
    
    Action items:
    [ ] Add to preferred-partner list on the website (their name + a line about the partnership)
    [ ] Send them 5 Summit Movers business cards / a digital card link
    [ ] File a COI for their building if Track A (even before first move — gesture of good faith)
    [ ] Set a 90-day check-in reminder
```

```
receiver: entity:tag
args:
  id: "{{ contact.id }}"
  add: ["partner:active", "lifecycle:education:repeat"]
```

### Partner referral tracking

Each partner gets a unique UTM / referral link so referral volume and close rate are
attributable per partner. Analytics agent tracks this weekly.

## Phase 5 — Quarterly review (agent)

After 90 days, `analytics` agent pulls:
- Referrals received per partner
- Close rate on partner referrals vs all-channel average
- Partners with 0 referrals (follow up or de-list)

## Signals

- Prospect list confirmed: `mark("b2b:list_confirmed", { city, count })`
- Outreach sent: `signal("b2b:outreach_sent", { contact_id, track })`
- Reply received: `signal("b2b:reply", { contact_id, outcome })`
- Partner onboarded: `mark("b2b:partner_active", { contact_id, city })`
- Referral lead in: `lifecycle:sales:quote_requested` with `source: b2b_partner`

## Notes

- **Reciprocal framing is the key.** "Access to your customer base + referrals" beats
  "we'd love to be your preferred mover" — research shows 5%+ reply rates vs ~1% for
  direct sales framing. Always lead with what the partner gets.
- **Never promise exclusivity** without the owner's sign-off — it limits the partner network.
- Track A (apartments) targets COI-requiring buildings first: they already need what Summit
  does routinely, making the opening completely natural.
- B2B partner leads close at higher rates than cold ad leads (warm intro, context already set).
  Track separately in the attribution model so CAC reflects this.
