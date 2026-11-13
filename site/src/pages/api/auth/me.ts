import type { APIRoute } from 'astro'
import { authNotConfigured, getAuth } from '../../../lib/auth'

export const prerender = false

export const GET: APIRoute = async ({ request }) => {
  const auth = await getAuth()
  if (!auth) return authNotConfigured()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return Response.json({ user: null }, { status: 401 })
  return Response.json({ user: session.user })
}
