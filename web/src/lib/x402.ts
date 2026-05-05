type KVLike = {
  get(k: string): Promise<string | null>
  put(k: string, v: string, opts?: { expirationTtl?: number }): Promise<void>
}

export async function verifyReceipt(opts: {
  receipt: string
  amount: number
  expectedAmount: number
  slug: string
  kv?: KVLike
}): Promise<{ ok: boolean; reason?: string }> {
  const { receipt, amount, expectedAmount, slug, kv } = opts
  if (!receipt || receipt.length < 8) return { ok: false, reason: 'invalid receipt' }
  if (amount < expectedAmount * 0.99) return { ok: false, reason: 'insufficient amount' }
  if (kv) {
    const key = `x402:${slug}:${receipt}`
    if (await kv.get(key)) return { ok: false, reason: 'receipt already used' }
    await kv.put(key, '1', { expirationTtl: 7776000 })
  }
  return { ok: true }
}
