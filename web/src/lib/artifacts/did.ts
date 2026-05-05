export interface DIDInput {
  did: string
  pubkey?: string
}

export function buildDIDDocument(input: DIDInput): Record<string, unknown> {
  const doc: Record<string, unknown> = {
    '@context': ['https://www.w3.org/ns/did/v1'],
    id: input.did,
    verificationMethod: [],
    authentication: [],
  }
  if (input.pubkey) {
    const keyId = `${input.did}#key-1`
    doc.verificationMethod = [{ id: keyId, type: 'Ed25519VerificationKey2020', controller: input.did, publicKeyMultibase: input.pubkey }]
    doc.authentication = [keyId]
  }
  return doc
}
