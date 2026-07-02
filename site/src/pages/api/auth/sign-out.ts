import type { APIRoute } from 'astro'
import { auth } from '../../../lib/auth'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  const res = await auth.api.signOut({ headers: request.headers, returnHeaders: true })
  const headers = new Headers({ 'Content-Type': 'application/json' })
  if (res instanceof Response) return res
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers })
}
