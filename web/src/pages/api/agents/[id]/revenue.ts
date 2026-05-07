import type { APIRoute } from 'astro'

export const prerender = false

// Stub — x402 KV doesn't have queryable history per Q3 recon
export const GET: APIRoute = async ({ params }) => {
  const { id } = params
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  return Response.json({ total: '0', currency: 'USD', txs: [] })
}
