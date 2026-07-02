import type { APIRoute } from 'astro'
import { auth } from '../../../lib/auth'

export const prerender = false

export const GET: APIRoute = async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return Response.json({ user: null }, { status: 401 })
  return Response.json({ user: session.user })
}
