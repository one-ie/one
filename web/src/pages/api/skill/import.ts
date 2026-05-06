import type { APIRoute } from 'astro'
import { importSkill, withPrice } from '../../../lib/skill/import'
import { parse } from '../../../lib/skill/parser'
import { toSkill } from '../../../lib/skill/loader'

export const prerender = false

type CfEnv = { SERVER_SECRET?: string; CONTENT?: R2Bucket }

async function getEnv(): Promise<CfEnv> {
  const mod = (await import('cloudflare:workers' as string)) as { env?: CfEnv }
  return (mod.env ?? {}) as CfEnv
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/

export const POST: APIRoute = async ({ request }) => {
  const env = await getEnv()
  if (!env.CONTENT || !env.SERVER_SECRET) {
    return new Response(JSON.stringify({ error: 'not configured' }), { status: 503 })
  }
  // TODO: also accept passkey cookie auth — for now Bearer only
  const auth = request.headers.get('Authorization') ?? ''
  if (auth !== `Bearer ${env.SERVER_SECRET}`) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 })
  }
  const body = (await request.json()) as { ref?: string; content?: string; slug?: string; name?: string; price?: number }
  if (!body.slug || !SLUG_RE.test(body.slug)) {
    return new Response(JSON.stringify({ error: 'valid slug required' }), { status: 400 })
  }
  if (!body.ref && !body.content) {
    return new Response(JSON.stringify({ error: 'ref or content required' }), { status: 400 })
  }
  const price = body.price ?? 0.02

  if (body.content) {
    const stem = body.name ?? 'skill'
    const parsed = parse(body.content, { pathStem: stem })
    const finalName = body.name ?? String(parsed.meta.name ?? stem)
    const namedKey = `${body.slug}/skills/${finalName}/SKILL.md`
    const finalContent = withPrice(body.content, price)
    await env.CONTENT.put(namedKey, finalContent, {
      customMetadata: { sourceUrl: 'inline', importedAt: new Date().toISOString() },
    })
    const skill = toSkill(parsed)
    return new Response(JSON.stringify({
      skill,
      key: namedKey,
      preview: { name: finalName, price, body: parsed.body.slice(0, 280) },
      diagnostics: parsed.diagnostics,
    }), { headers: { 'Content-Type': 'application/json' } })
  }

  const result = await importSkill(body.ref!, body.slug, env.CONTENT, { price, chosenName: body.name })
  if (!result) {
    return new Response(JSON.stringify({ error: 'import failed' }), { status: 502 })
  }
  return new Response(JSON.stringify({
    skill: result.skill,
    key: result.namedKey,
    preview: { name: result.skill.name, price: result.skill.price ?? price, body: result.skill.body.slice(0, 280) },
    diagnostics: result.skill.diagnostics,
  }), { headers: { 'Content-Type': 'application/json' } })
}
