import type { APIRoute } from 'astro'
import { getEnv } from '@/lib/cf-env'

export const prerender = false

interface AgentGeneration {
  id: string
  agent_id: string
  generation: number
  prompt: string
  score: number
  created_at: number
}

export const GET: APIRoute = async ({ params }) => {
  const { id } = params
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  const rawEnv = await getEnv() as unknown as { DB: D1Database; SERVER_SECRET: string }
  const { DB } = rawEnv
  if (!DB) return Response.json({ error: 'not configured' }, { status: 503 })

  const { results } = await DB
    .prepare('SELECT * FROM agent_generations WHERE agent_id = ? ORDER BY generation DESC')
    .bind(id)
    .all<AgentGeneration>()

  return Response.json({ generations: results })
}
