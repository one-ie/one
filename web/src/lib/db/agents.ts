export interface Agent {
  id: string
  owner_id: string
  slug: string
  name: string
  frontmatter: string
  body: string
  state: 'draft' | 'live' | 'paused' | 'evolving'
  generation: number
  created_at: number
  updated_at: number
}

export type AgentInsert = Omit<Agent, 'id' | 'created_at' | 'updated_at'>

export async function listAgents(db: D1Database, ownerId: string): Promise<Agent[]> {
  const { results } = await db
    .prepare('SELECT * FROM agents WHERE owner_id = ? ORDER BY updated_at DESC')
    .bind(ownerId)
    .all<Agent>()
  return results
}

export async function getAgent(db: D1Database, id: string): Promise<Agent | null> {
  return db
    .prepare('SELECT * FROM agents WHERE id = ?')
    .bind(id)
    .first<Agent>()
}

export async function createAgent(db: D1Database, data: AgentInsert): Promise<Agent> {
  const id = crypto.randomUUID()
  const now = Date.now()
  await db
    .prepare(
      'INSERT INTO agents (id, owner_id, slug, name, frontmatter, body, state, generation, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
    .bind(id, data.owner_id, data.slug, data.name, data.frontmatter, data.body, data.state, data.generation, now, now)
    .run()
  return { id, ...data, created_at: now, updated_at: now }
}

export async function patchAgentFrontmatter(
  db: D1Database,
  id: string,
  frontmatter: string
): Promise<{ success: boolean }> {
  const now = Date.now()
  return db
    .prepare('UPDATE agents SET frontmatter = ?, updated_at = ? WHERE id = ?')
    .bind(frontmatter, now, id)
    .run()
}
