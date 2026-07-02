import type { Grant, Burn, BillingConfig, RateBlob } from './billing-types'
export type { RateBlob }

const RATES: Record<string, Pick<RateBlob, 'input_per_1k' | 'output_per_1k'>> = {
  'default': { input_per_1k: 0.003, output_per_1k: 0.015 },
}

export function rateFor(model: string): Pick<RateBlob, 'input_per_1k' | 'output_per_1k'> {
  return RATES[model] ?? RATES['default']
}

export function toCredits(usd: number, ratePerCredit = 0.0001): number {
  return Math.round(usd / ratePerCredit)
}

export async function currentBalance(workspace: string, env: { DB: D1Database }): Promise<number> {
  const [g, b] = await Promise.all([
    env.DB.prepare('SELECT COALESCE(SUM(amount_credits),0) as t FROM credit_grants WHERE workspace=?')
      .bind(workspace).first<{ t: number }>(),
    env.DB.prepare('SELECT COALESCE(SUM(amount_credits),0) as t FROM credit_burns WHERE workspace=?')
      .bind(workspace).first<{ t: number }>(),
  ])
  return (g?.t ?? 0) - (b?.t ?? 0)
}

export async function computeBurn(p: {
  upstream: number
  workspace: string
  parent?: string
  reason: Burn['reason']
  model?: string
  recipient?: string
  config?: Pick<BillingConfig, 'platform_margin_pct' | 'platform_floor_pct' | 'markup_pct'>
}): Promise<Burn> {
  const cfg = p.config ?? { platform_margin_pct: 20, platform_floor_pct: 5, markup_pct: 0 }
  const platform_margin = Math.max(
    Math.floor(p.upstream * cfg.platform_floor_pct / 100),
    Math.floor(p.upstream * cfg.platform_margin_pct / 100),
  )
  return {
    workspace: p.workspace,
    reason: p.reason,
    cost_credits: p.upstream,
    platform_margin,
    recipient_share: 0,
    model: p.model,
    recipient: p.recipient,
  }
}

export async function debitPool(
  b: Burn,
  env: { DB: D1Database },
  planGrant = 1000,
  opts?: { actor?: string; group?: string },
): Promise<{ ok: true } | { ok: false; reason: '402' | 'floored' | 'budget_exhausted' }> {
  const [stateRow, monthlyRow] = await Promise.all([
    env.DB.prepare(`
      SELECT o.billing_state,
             COALESCE(p.markup_pct, 0)  AS parent_markup_pct,
             p.monthly_cap              AS parent_monthly_cap
      FROM owners o
      LEFT JOIN owners p ON p.slug = o.parent_slug
      WHERE o.slug = ?
    `).bind(b.workspace).first<{
      billing_state: string
      parent_markup_pct: number
      parent_monthly_cap: number | null
    }>(),
    env.DB.prepare(`
      SELECT COALESCE(SUM(amount_credits), 0) AS t
      FROM credit_burns
      WHERE workspace = ? AND ts > strftime('%s', 'now', 'start of month')
    `).bind(b.workspace).first<{ t: number }>(),
  ])

  const billingState = stateRow?.billing_state ?? 'live'
  if (billingState === 'suspended' || billingState === 'archived') {
    return { ok: false, reason: '402' }
  }

  // Agency margin is always derived from the parent's markup_pct — callers don't set it
  const agencyMargin = Math.floor(b.cost_credits * (stateRow?.parent_markup_pct ?? 0) / 100)
  const amount = b.cost_credits + agencyMargin + b.platform_margin + b.recipient_share

  const monthlyCap = stateRow?.parent_monthly_cap
  if (monthlyCap != null && (monthlyRow?.t ?? 0) + amount > monthlyCap) {
    return { ok: false, reason: 'floored' }
  }

  // Per-recipient budget enforcement: check actor then group allocations.
  // Budget + period_used live in allocations (D1 hot path — no TypeDB call).
  const budgetIds: string[] = []
  if (opts?.actor || opts?.group) {
    const recipients = [opts.actor, opts.group].filter(Boolean) as string[]
    const allocs = await Promise.all(recipients.map(r =>
      env.DB.prepare(
        `SELECT alloc_id, monthly_credits, period_used FROM allocations
         WHERE recipient = ? AND mode = 'transfer' AND monthly_credits IS NOT NULL`
      ).bind(r).first<{ alloc_id: string; monthly_credits: number; period_used: number }>()
    ))
    for (const alloc of allocs) {
      if (!alloc) continue
      if (alloc.period_used + amount > alloc.monthly_credits) {
        return { ok: false, reason: 'budget_exhausted' }
      }
      budgetIds.push(alloc.alloc_id)
    }
  }

  const balance = await currentBalance(b.workspace, env)
  if (balance - amount < -planGrant) return { ok: false, reason: 'floored' }
  if (balance < amount) return { ok: false, reason: '402' }

  await env.DB.prepare(
    `INSERT INTO credit_burns
       (workspace, reason, amount_credits, cost_credits, agency_margin, platform_margin, recipient_share, recipient, model, test_mode, actor, "group")
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    b.workspace, b.reason, amount, b.cost_credits,
    agencyMargin, b.platform_margin, b.recipient_share,
    b.recipient ?? null, b.model ?? null, b.test_mode ?? 0,
    opts?.actor ?? null, opts?.group ?? null,
  ).run()

  // Increment period_used for each allocation that gated this burn.
  if (budgetIds.length > 0) {
    const nowSec = Math.floor(Date.now() / 1000)
    await Promise.all(budgetIds.map(id =>
      env.DB.prepare(
        `UPDATE allocations SET period_used = period_used + ?, updated_at = ? WHERE alloc_id = ?`
      ).bind(amount, nowSec, id).run()
    ))
  }

  return { ok: true }
}

export async function upsertAllocation(
  p: {
    parent: string
    recipient: string
    recipient_type: 'client' | 'group' | 'staff'
    mode: 'pool' | 'transfer' | 'resell'
    monthly_credits?: number | null
    markup_pct?: number | null
    cap?: number | null
    cap_locked?: number
    rollover?: 'none' | 'unused' | 'all'
  },
  env: { DB: D1Database },
): Promise<void> {
  const now = Math.floor(Date.now() / 1000)
  const id = `${p.parent}:${p.recipient}:${now}`
  await env.DB.prepare(`
    INSERT INTO allocations
      (alloc_id, parent, recipient, recipient_type, mode,
       monthly_credits, markup_pct, cap, cap_locked, rollover,
       period_used, period_end, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, ?, ?)
    ON CONFLICT(parent, recipient) DO UPDATE SET
      mode            = excluded.mode,
      monthly_credits = excluded.monthly_credits,
      markup_pct      = excluded.markup_pct,
      cap             = excluded.cap,
      cap_locked      = excluded.cap_locked,
      rollover        = excluded.rollover,
      updated_at      = excluded.updated_at
  `).bind(
    id, p.parent, p.recipient, p.recipient_type, p.mode,
    p.monthly_credits ?? null, p.markup_pct ?? null,
    p.cap ?? null, p.cap_locked ?? 0, p.rollover ?? 'none',
    now, now,
  ).run()
}

export async function creditPool(g: Grant, env: { DB: D1Database }): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO credit_grants
       (workspace, source, amount_credits, cents_paid, parent, expires_at, rail, rail_ref, test_mode)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    g.workspace, g.source, g.amount_credits, g.cents_paid ?? null,
    g.parent ?? null, g.expires_at ?? null, g.rail ?? null, g.rail_ref ?? null,
    g.test_mode ?? 0,
  ).run()
}
