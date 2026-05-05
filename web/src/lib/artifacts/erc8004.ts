export interface ErcAgentInput {
  chainId: number
  identityRegistry: string
  agentId: string
  name: string
  description?: string
  endpoint: string
}

export interface ERC8004Result {
  metadata: Record<string, unknown>
  register: Record<string, unknown>
}

export function buildERC8004Registration(input: ErcAgentInput): ERC8004Result {
  const metadata = { name: input.name, description: input.description ?? '', endpoint: input.endpoint, schemaVersion: '1.0' }
  return {
    metadata,
    register: { chainId: input.chainId, identityRegistry: input.identityRegistry, agentId: input.agentId, metadata },
  }
}
