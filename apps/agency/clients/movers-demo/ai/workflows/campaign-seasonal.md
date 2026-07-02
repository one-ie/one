---
id: campaign-seasonal
label: Seasonal Peak Campaign (Summer / End-of-Month)
description: 6–8 week pre-peak campaign for Summit Movers' busy season (May–August peak; end-of-month surges). Builds awareness, educates the audience, then converts at peak. Infrastructure (sequences, city pages, GMB posts, ad creative) must be live before the campaign fires.
trigger: manual
department: marketing
run_weeks_before_peak: 6
---

# Seasonal Peak Campaign

> **Worked instance:** `data/campaigns/summer-2026/` is this workflow fully filled — manifest +
> real copy for every channel (hooks, Meta + Google ads, email sequence, GMB posts, city page),
> grounded in oo-brain evidence. Read that pack to see the concrete output; this file is the process.

**Goal:** Fill Summit Movers' calendar for the peak moving season (May–August, end-of-month
surges) before competitors do. The rule from the research: **infrastructure first, pitch last.**
Pre-launch phase is pure education and curiosity — not a sell. The sell happens in the final 2 weeks
when demand peaks and the audience is already warm.

## Timeline

```
Week –8 to –6  INFRASTRUCTURE  Pages, sequences, ad creative, GMB posts ready
Week –6 to –4  AWARENESS       Education content — cost guides, city spotlights, "how to vet a mover"
Week –4 to –2  CONSIDERATION   Social proof — reviews, crew stories, before/after city pages
Week –2 to 0   CONVERSION      "Calendar filling" urgency, estimate-book CTA, frequency lift
Week 0+        PEAK SERVICE    Book calendar runs; pause new acquisition if fully booked
```

## Phase 1 — Infrastructure (weeks –8 to –6)

All of this must be **live before the campaign fires**. A campaign without infrastructure
is wasted spend.

### Checklist (human gate)

```
receiver: human:ask
args:
  assignee: "{{ owner }}"
  prompt: |
    Summer campaign infrastructure check. Confirm each before launch:

    City pages
    [ ] All 9 target cities have a live service-area page
    [ ] Each page has: H1 with city + service, trust block (USDOT/MC/reviews/named owner),
        video-estimate CTA above the fold, FAQ section targeting "movers near me [city]"

    Ad creative
    [ ] Minimum 15 Meta/Google creative variants ready (hooks, headlines, body copy)
        Fear-killers: "No hostage loading.", "Written estimate — the number we quote is the number you pay."
    [ ] At least 3 creative angles: trust (USDOT), proof (review count), price clarity (estimate type)

    Email sequences
    [ ] 3-email awareness sequence staged in HubSpot/GHL (cost guide → reviews → date-availability)
    [ ] lead-capture workflow confirmed live

    GMB
    [ ] 4 GMB posts scheduled for the 8-week run (1 per 2 weeks)
    [ ] Google Business Profile Q&A answered: binding estimate?, USDOT?, deposit required?

    Confirm when all boxes are checked.
```

## Phase 2 — Awareness (weeks –6 to –4)

Education and curiosity only. **No pitch.**

### Content cadence (agent)

`marketing` agent produces one piece per week:

| Week | Format | Topic |
|---|---|---|
| –6 | Cost guide blog + GMB post | "How much does a local move cost in Austin in 2026?" Real price ranges (no ranges that sell) |
| –5 | City spotlight page | "[City] apartment movers — what to expect, what to ask" |
| –4 | "How to vet a mover" checklist | USDOT/MC check, binding vs non-binding, deposit red flags |

```
receiver: space:post
args:
  group: world:{{ workspace.slug }}:broadcast
  content: |
    [Education piece for week {{ week }}]
    {{ content }}
```

## Phase 3 — Consideration (weeks –4 to –2)

Social proof goes out. The audience is researching; give them the proof they're looking for.

### Social proof sequence (agent)

```
receiver: space:post
args:
  group: world:{{ workspace.slug }}:broadcast
  content: |
    Week –4: Highlight 3 specific reviews (quote the reviewer's exact words — never paraphrase).
             Format: "[City] move, [home_size], [result]." No adjectives. Facts only.

    Week –3: Crew story. One crew member, their route, a real moment from a recent move.
             Human-feeling > polished marketing.

    Week –2: "{{ review_count }}+ moves since 2016. Here's what we've learned about [city] traffic /
             buildings / timing." Local knowledge signals = trust in a commodity market.
```

### Ad creative rotation (tool)

Rotate 3+ creative variants in ad accounts. Track CTR per variant weekly — pause anything
below 1% CTR after 500 impressions.

## Phase 4 — Conversion (weeks –2 to 0)

Now pitch. Frequency lifts: 2× normal send cadence for the 2-week window only.

### "Calendar filling" sequence — 4 messages (tool)

```
Message 1 (day –14):
  Subject: Summer calendar update
  Our {{ month }} calendar is filling up — especially the last weekend of the month.
  If you're moving in {{ month }}, locking your estimate slot now takes 2 minutes.
  → {{ estimate_link }}

Message 2 (day –10):
  Subject: Re: your {{ month }} move
  Quick note — we've had 3 new bookings this week for the last 2 weeks of {{ month }}.
  If you're in that window: {{ estimate_link }}

Message 3 (day –7):
  Subject: Written estimate, no surprises
  Our summer rate for a {{ home_size }} local move in {{ city }}: roughly {{ price_range }}.
  That's a binding or not-to-exceed quote — the number we give you is the number you pay.
  → {{ estimate_link }}

Message 4 (day –3):
  Subject: One last open slot
  We have one crew slot left for the {{ peak_weekend }} weekend. After that we're fully booked.
  If that's your window: {{ estimate_link }} or call (512) 555-0142.
```

```
receiver: entity:tag
args:
  id: "{{ contact.id }}"
  add: ["lifecycle:marketing:intent"]
```

### Frequency note

Doubling email sends during a 2-week peak window (from 2 to 4 messages) is the lever —
research shows ~50% revenue lift with controlled unsubscribes. Outside this 2-week window,
standard cadence applies. Do not run high-frequency year-round.

## Phase 5 — Peak service (week 0+)

- Pause new paid acquisition if booked out 3+ weeks (waste spend, create unhappy leads).
- `service` agent handles all booked moves per `move-day-service`.
- Analytics agent tracks CSAT daily during peak — one bad-weather / crew issue week is recoverable
  if caught fast.

## Signals

- Campaign start: `manual` (owner confirms infrastructure checklist)
- Awareness fired: `signal("campaign:awareness:sent", { week, format })`
- Social proof fired: `signal("campaign:proof:sent", { week })`
- Conversion messages sent: `signal("campaign:conversion:sent", { message_num })`
- Estimate booked from campaign: `mark("campaign:estimate_booked")`
- Booked move from campaign: `mark("campaign:move_booked")`

## Notes

- **6–8 weeks infrastructure lead time is non-negotiable.** A campaign without city pages,
  creative inventory, and email sequences live is wasted budget.
- **Pre-launch = education, not pitch.** The oo-brain research is clear: "Pre-launch must be
  education / inspiration / curiosity, not pitch." Pitching too early kills warm leads.
- **Creative volume matters.** Minimum 15 variants at campaign start. Most operators test 3
  and declare failure. Volume + rotation finds the hooks that convert.
- Never promise specific dates ("guaranteed pickup date") — FMCSA landmine. "Calendar filling"
  urgency is legitimate; fake countdown timers are not.
