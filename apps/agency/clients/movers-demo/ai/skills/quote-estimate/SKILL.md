---
name: quote-estimate
description: Prepare an honest moving estimate — pick the estimate type (binding / non-binding / not-to-exceed), build the line items, and state valuation. Use when a customer has had an in-home or video estimate and needs a written number.
model: google/gemini-3.5-flash
lifecycle: beta
---

# Quote Estimate

Produce a **written** estimate a customer can trust. The number must be defensible and the
estimate **type** must be named — FMCSA requires it, and naming it is what kills the
hostage-loading fear. Never output a verbal-only or rangeless quote for a real job.

## Inputs

- `home_size` — studio | 1-BR | 2-BR | 3-BR | 4-BR+ | office
- `move_type` — local | long-distance (interstate) | intrastate-long-distance
- `from_zip` / `to_zip` — for distance + access (stairs, elevator, long carry)
- `add_ons` — packing | unpacking | storage | specialty (piano/safe/hot tub) | junk-removal

## Estimate types (name one explicitly)

| Type | Meaning | When to use |
|---|---|---|
| **Binding** | Price locked; mover can't charge more, customer can't pay less. | Local, well-scoped moves; customers who fear surprises. **Default for trust.** |
| **Binding not-to-exceed** | Customer pays the lower of estimate or actual weight cost. | Long-distance; the most customer-friendly, increasingly the standard. |
| **Non-binding** | Estimate only; final on actual weight/services, capped at 110% at delivery. | Only when scope is genuinely unknown; always disclose the 110% rule. |

## Build the number (benchmarks — see `data/services.md` for the full table)

- **Local:** hourly × crew size × hours + truck, with a 2–4 hr minimum.
  (studio ≈ $400–700, 2-BR ≈ $800–1,800, 4-BR ≈ $2,500–5,500.)
- **Long-distance:** weight × miles + access fees (long carry, stairs, shuttle).
- **Packing:** $60–100/hr per packer + materials billed separately (boxes, paper, tape).
- **Storage:** $100–400/mo per vault or $1–3/sq ft warehouse; SIT capped at 90 days interstate.
- **Specialty:** piano $250–2,000, safe $300–800+ — if you can't price it, escalate to the owner.

## Always state

1. The **estimate type** (from the table above).
2. **What's included** (crew, truck, blankets, basic disassembly/reassembly) vs billed separately.
3. **Valuation:** released value ($0.60/lb) is the federal default; offer **Full Value
   Protection** at ~$6–12 per $1,000 declared value.
4. Access factors that move the price (stairs, elevator reservation, long carry, shuttle).

## Never

- Never write "guaranteed pickup date" (windows only), "lowest price guaranteed", or
  "100% damage-free".
- Never quote a specialty item or interstate guarantee you're unsure of — return a flag for
  `human:ask(owner)` instead.
- Never omit the estimate type. A number with no type is the scammer's quote.

## Output

A clean written estimate: type · total (or not-to-exceed) · included · valuation options ·
access notes · USDOT/MC line · a single "lock your date" CTA.
