import type { APIRoute } from 'astro'

export const prerender = false

// Stub — no messages table yet per Q2 recon
export const GET: APIRoute = async ({ params }) => {
  const { id } = params
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  return Response.json({ chats: [] })
}
