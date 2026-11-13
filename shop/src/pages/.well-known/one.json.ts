import type { APIRoute } from 'astro'
import config from '../../../one.config'
import attestation from '../../data/attestation.json'

export const prerender = true

// A public, signed statement: "this shop was made with ONE, these are its
// addresses, and this is who showed it ONE." Signed on the owner's machine with
// the shop's own Sui key at create time; anyone can check the signature against
// `publicKey`, and that the key derives `wallet.sui`. No cookie, no tracker.
export const GET: APIRoute = () =>
  Response.json({
    made_with: 'one',
    name: config.name,
    slug: config.slug,
    wallet: config.wallet,
    ref: config.ref || null,
    attestation: (attestation as { signature?: string }).signature ? attestation : null,
  })
