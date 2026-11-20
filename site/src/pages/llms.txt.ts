// The site's llms.txt: the business, its catalogue with prices (live from ONE's
// products:list for this site's workspace), and where to reach the front desk.
// SSR, so a price changed in ONE is the price an AI reads. This route replaces
// astro-seo-graph's generated llms.txt (astro.config.mjs no longer sets llmsTxt).
import type { APIRoute } from 'astro'
import { SITE } from '@/lib/seo-site'
import { chatConfig } from '@/lib/chat-config'
import { readCatalogue, siteLlmsTxt } from '@/lib/front-desk'
import { one } from '@/lib/one'

export const prerender = false

export const GET: APIRoute = async () => {
  const client = await one()
  const ask = client ? (receiver: string, data: Record<string, unknown>) => client.ask(receiver, data) as Promise<{ kind: string; result?: unknown }> : null
  const catalogue = await readCatalogue(ask, chatConfig)
  const body = siteLlmsTxt({ name: SITE.name, url: SITE.url, description: SITE.description, catalogue })
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=300' } })
}
