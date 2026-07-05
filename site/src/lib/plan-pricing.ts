/**
 * The single source of truth for named checkout plans — both payment
 * rails (Stripe PaymentIntents in create-intent.ts, crypto payment links
 * in link.ts) resolve a `planId` through this map so a plan's price can
 * never drift between the two rails, or between server and the pricing
 * cards that link to them.
 */
export interface Plan {
  cents: number
  label: string
}

export const PLANS: Record<string, Plan> = {
  pro: { cents: 2900, label: 'Pro plan' },
  team: { cents: 9900, label: 'Team plan' },
}

export function resolvePlan(planId: string | undefined | null): Plan | null {
  if (!planId) return null
  return PLANS[planId] ?? null
}
