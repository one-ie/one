import type { APIRoute } from 'astro'

export const prerender = false

// Stub — substrate SDK call wired in W6
export const GET: APIRoute = async ({ params }) => {
  const { id } = params
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  return Response.json({ signals: [], paths: [] })
}
