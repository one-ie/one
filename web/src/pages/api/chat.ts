import type { APIRoute } from 'astro'
import { getEnv } from '../../lib/cf-env'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  const env = await getEnv()
  const clawUrl = (env as Record<string, string | undefined>).CLAW_URL ?? 'http://localhost:8787'
  const clawKey = (env as Record<string, string | undefined>).CLAW_KEY

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (clawKey) {
    headers['Authorization'] = `Bearer ${clawKey}`
  }

  const upstream = await fetch(`${clawUrl}/message`, {
    method: 'POST',
    headers,
    body: request.body,
    // @ts-expect-error: duplex required for streaming request body passthrough
    duplex: 'half',
  })

  return upstream
}
