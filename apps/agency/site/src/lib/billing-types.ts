export type BillingReason =
  | 'llm'
  | 'embed'
  | 'image'
  | 'signal'
  | 'storage'
  | 'bandwidth'
  | 'tool'
  | string

export interface Grant {
  workspace: string
  source: string
  amount_credits: number
  cents_paid?: number
  parent?: string
  expires_at?: number
  rail?: string
  rail_ref?: string
  test_mode?: number
}

export interface Burn {
  workspace: string
  reason: BillingReason
  cost_credits: number
  platform_margin: number
  recipient_share: number
  model?: string
  recipient?: string
  test_mode?: number
}

export interface RateBlob {
  model: string
  input_per_1k: number
  output_per_1k: number
  embed_per_1k?: number
  image_per_unit?: number
}

export interface BillingConfig {
  platform_margin_pct: number
  platform_floor_pct: number
  markup_pct: number
}
