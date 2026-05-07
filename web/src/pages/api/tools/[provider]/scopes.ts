import type { APIRoute } from 'astro'

export const prerender = false

// Hardcoded scopes per provider.
// TODO: once Composio SDK is installed, replace with:
//   const adapter = new ComposioAdapter(env.COMPOSIO_API_KEY)
//   const scopes = await adapter.scopes(provider)
const PROVIDER_SCOPES: Record<string, readonly string[]> = {
  slack: ['channels:read', 'chat:write', 'users:read'],
  stripe: ['read_only'],
  github: ['repo', 'read:user'],
}

// GET /api/tools/:provider/scopes
// Returns the default OAuth scopes for the given provider.
// No auth required — scopes are public metadata.
export const GET: APIRoute = async ({ params }) => {
  const provider = params.provider ?? ''
  const scopes = PROVIDER_SCOPES[provider] ?? []

  return new Response(JSON.stringify({ provider, scopes }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
