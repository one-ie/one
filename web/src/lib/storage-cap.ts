type KVLike = {
  get(k: string): Promise<string | null>
  put(k: string, v: string, opts?: { expirationTtl?: number }): Promise<void>
}

export const CAP_BYTES = 100 * 1024 * 1024
export const CAP_FILES = 1000

export async function checkCap(
  slug: string,
  content: R2Bucket,
  kv?: KVLike,
): Promise<{ ok: boolean; usage: number; limit: number; warn: boolean }> {
  const listed = await content.list({ prefix: `${slug}/` })
  const usage = listed.objects.reduce((sum, o) => sum + o.size, 0)
  const files = listed.objects.length
  const over = usage >= CAP_BYTES || files >= CAP_FILES
  const warn = !over && usage >= CAP_BYTES * 0.8
  if (over && kv) {
    const reqKey = `cap:${slug}:reqs`
    const reqs = parseInt((await kv.get(reqKey)) ?? '0', 10)
    await kv.put(reqKey, String(reqs + 1), { expirationTtl: 86400 })
  }
  return { ok: !over, usage, limit: CAP_BYTES, warn }
}
