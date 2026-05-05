export interface SignManifest {
  subject: string
  digest: string
  mediaType: string
  annotations: Record<string, string>
}

export async function buildSignManifest(
  subject: string,
  content: string,
  annotations: Record<string, string> = {},
): Promise<SignManifest> {
  const bytes = new TextEncoder().encode(content)
  const buf = await crypto.subtle.digest('SHA-256', bytes)
  const digest = Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  return { subject, digest: `sha256:${digest}`, mediaType: 'text/markdown', annotations }
}
