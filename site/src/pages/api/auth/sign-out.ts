import type { APIRoute } from 'astro'
import { authNotConfigured, getAuth } from '../../../lib/auth'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  const auth = await getAuth()
  if (!auth) return authNotConfigured()
  const res = await auth.api.signOut({ headers: request.headers, returnHeaders: true })
  const headers = new Headers({ 'Content-Type': 'application/json' })
  if (res instanceof Response) return res
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers })
}
