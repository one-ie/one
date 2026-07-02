# Services — Summit Movers

> The mover's service menu, with 2026 US benchmark pricing. This is the node-localized
> version of the mover niche services pack (raw source:
> `../agency-operator/templates/_niches/mover/services.md`). Trim to the services this
> operator actually offers, and re-check `[VERIFY]` prices against current state tariffs
> before publishing on a customer-facing page.

## Primary services

| Service | Slug | Typical price (US 2026) | Notes |
|---|---|---|---|
| Local moving (same-metro, hourly) | `local-move` | $100–200/hr (2 movers + truck); studio $400–700, 2-BR $800–1,800, 4-BR $2,500–5,500 | Hourly with 2–4 hr minimum is standard. |
| Long-distance (interstate) | `long-distance-moving` | $2,500–10,000+ (weight + miles) | Requires active USDOT + MC. Binding / non-binding / not-to-exceed per FMCSA. |
| Intrastate long-distance | `intrastate-long-distance` | $1,500–6,000 (state tariff) | State regulator sets tariff (CA, FL, TX, NY…). Don't say "long distance" unqualified. |
| Packing (full-pack) | `packing-services` | $60–100/hr per packer; 2-BR $700–1,400 | Materials billed separately. |
| Unpacking | `unpacking` | $60–100/hr per packer | Often bundled with full-service. |
| Storage (short + long term) | `storage` | $100–400/mo per vault, or $1–3/sq ft warehouse | SIT capped at 90 days interstate. |
| Piano / specialty | `piano-moving` | upright $250–1,000; grand $400–2,000; safes $300–800+ | Specialty equipment; escalate if unsure. |
| Commercial / office | `commercial-moving` | $500–15,000+ project-based | After-hours premium; building COI required. |
| Labor-only / load help | `labor-only` | $60–150/hr per mover (2 hr min) | High-volume lead-gen service. |
| Junk removal / donation haul | `junk-removal` | $150–600 per load | Natural attach to move-out. |

## Secondary / supporting

| Service | Slug | Notes |
|---|---|---|
| Apartment moves | `apartment-moves` | COI for apartment mgmt is the gatekeeper; build PM relationships. |
| Senior / assisted-living | `senior-moves` | NASMM cert; sensitive service. |
| Military (GHC / HHG) | `military-moves` | DOD ProMover / TSP contracts; heavy process. |
| Last-minute / same-day | `same-day-moves` | Premium pricing; capacity-dependent. |
| White-glove / luxury | `white-glove` | Crating, named crew; 30–50% premium. |
| International (forwarded) | `international-moving` | Usually brokered via a freight forwarder, not direct. |

## Service-area conventions (the local-SEO play)

- Advertise a metro + 30–60 mi radius for local; long-distance is nationwide (if MC-authorized)
  or in-state only (intrastate-only).
- Home page names 5–12 primary cities; a dedicated page per suburb / named apartment complex
  is the standard SEO + conversion play (one page per `service × city` — the lead-gen matrix).
- Intrastate-only movers must use "intrastate long-distance [state]", never bare "long distance".

## Schema.org

Primary type: **`MovingCompany`** (subclass of LocalBusiness). Always include `name`, `address`,
`telephone`, `areaServed`, `serviceType` (slugs above), `priceRange`, `aggregateRating` (real
reviews only), and `identifier` PropertyValues for **USDOT** and **MC** numbers. Surface USDOT +
MC in schema AND in the visible footer for interstate carriers (FMCSA rule).
