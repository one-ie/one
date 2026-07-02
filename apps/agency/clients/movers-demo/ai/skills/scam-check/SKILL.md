---
name: scam-check
description: Answer the customer's #1 fear — "how do I know you're not a scam / won't hold my stuff hostage?" Turns FMCSA verification into a trust close. Use when a lead raises legitimacy, hostage-loading, deposit, or "is this company real" concerns.
model: google/gemini-3.5-flash
lifecycle: beta
---

# Scam Check — turn the #1 fear into the close

The single biggest driver in mover search is scam fear: hostage-loading (truck loaded, then
the driver demands 2–3× the quote before unloading), hidden fees, fake companies. Customers
literally Google "USDOT number lookup" and "is [company] legit". This skill answers that fear
**with verifiable facts**, which is exactly how an honest mover wins.

## The customer's fear, named

- "You'll hold my stuff hostage." (hostage-loading)
- "Your quote will double on move day." (hidden fees)
- "You're a broker / fake company." (no real authority)
- "I'll lose my deposit." (prepayment scam)

## The honest answer (give the proof, not reassurance)

| Fear | Proof to give |
|---|---|
| Hostage-loading | A **binding** or **not-to-exceed** estimate **in writing** — the number quoted is the number paid. |
| Fake / broker | **USDOT 3987654 / MC 1456789**, clickable to the FMCSA SAFER lookup so they verify us in 10 seconds. We carry the move ourselves — not a broker. |
| Hidden fees | A published fee list (long carry, stairs, shuttle, bulky item) — no surprises, named up front. |
| Deposit scam | No deposit for standard local moves (if true); any reservation fee is disclosed and refundable. |
| Day labor | A **named crew** on the Bill of Lading, real crew photos — not anonymous day labor. |

## How to teach the customer to vet ANY mover (this builds trust fastest)

Tell them the FMCSA red flags — being the mover who *teaches* the checklist signals you pass it:

1. Look up the USDOT/MC on **FMCSA SAFER** — "NOT AUTHORIZED" for interstate is a hard stop.
2. Insist on a **written** estimate with the **type** named (binding / NTE / non-binding).
3. Walk away from **cash-only** or **large-deposit-before-pickup** demands.
4. Require an **in-home or video estimate** — anyone quoting sight-unseen on a big move is risky.
5. Read recent **Google reviews** for named-crew mentions, not just a star count.

## Compliance guardrails

- Never disparage a named competitor — describe red flags factually, don't accuse.
- Never claim a license you can't show the number for.
- "AMSA certified" is outdated — the cert is **ProMover**.
- Source for all of the above: `data/knowledge/regulatory-landmines.md` + `trust-signals.md`.

## When to use

- A lead asks "is this legit", "do you require a deposit", "what if you're late / break things".
- Writing the "Why us" / "Avoid moving scams" page copy.
- Any objection that's really a trust objection underneath.
