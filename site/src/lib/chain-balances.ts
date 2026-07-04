// Live chain-balance readers. Each does a raw JSON-RPC / REST call through an
// INJECTED fetchImpl (defaults to global fetch) so callers stay unchanged and
// tests can pass a mock. Every reader returns a decimal STRING on success or
// null on ANY failure (bad status, missing field, thrown) — NEVER '0'. Callers
// render null as '—'; coalescing null→'0' is forbidden.
// Ported from one-ie/one.ie/web/src/lib/chain-balances.ts — same contract.

export async function getSuiBalance(
  address: string,
  rpcUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  try {
    const res = await fetchImpl(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'suix_getBalance',
        params: [address, '0x2::sui::SUI'],
      }),
    })
    if (!res.ok) return null
    const json = (await res.json()) as { result?: { totalBalance?: string } }
    const mist = json.result?.totalBalance
    if (mist == null) return null
    return (Number(mist) / 1e9).toFixed(4)
  } catch {
    return null
  }
}

export async function getEthBalance(
  address: string,
  rpcUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  try {
    const res = await fetchImpl(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getBalance', params: [address, 'latest'] }),
    })
    if (!res.ok) return null
    const json = (await res.json()) as { result?: string }
    if (!json.result) return null
    return (Number(BigInt(json.result)) / 1e18).toFixed(6)
  } catch {
    return null
  }
}

export async function getSolBalance(
  address: string,
  rpcUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  try {
    const res = await fetchImpl(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getBalance', params: [address] }),
    })
    if (!res.ok) return null
    const json = (await res.json()) as { result?: { value?: number } }
    const lamports = json.result?.value
    if (lamports == null) return null
    return (Number(lamports) / 1e9).toFixed(4)
  } catch {
    return null
  }
}

export async function getBtcBalance(
  address: string,
  apiUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  try {
    const res = await fetchImpl(`${apiUrl}/address/${encodeURIComponent(address)}`)
    if (!res.ok) return null
    const json = (await res.json()) as { chain_stats?: { funded_txo_sum: number; spent_txo_sum: number } }
    if (!json.chain_stats) return null
    const sats = json.chain_stats.funded_txo_sum - json.chain_stats.spent_txo_sum
    return (sats / 1e8).toFixed(8)
  } catch {
    return null
  }
}

export interface SelfHostedWallet { sui?: string; evm?: string; sol?: string; btc?: string }

// Reads the site's own env-configured wallet (see .dev.vars.example) — the
// addresses `one wallet keygen` generated, kept locally, never derived
// through the substrate. Undefined fields mean that chain isn't configured.
export function readSelfHostedWallet(env: Record<string, string>): SelfHostedWallet {
  return {
    sui: env.WALLET_SUI_ADDRESS || undefined,
    evm: env.WALLET_EVM_ADDRESS || undefined,
    sol: env.WALLET_SOL_ADDRESS || undefined,
    btc: env.WALLET_BTC_ADDRESS || undefined,
  }
}

const SUI_RPC = 'https://fullnode.testnet.sui.io:443'
const ETH_RPC = 'https://rpc.sepolia.org'
const SOL_RPC = 'https://api.devnet.solana.com'
const BTC_API = 'https://blockstream.info/testnet/api'

export interface ChainBalance { chain: 'sui' | 'evm' | 'sol' | 'btc'; address: string; balance: string | null }

// Fetches live testnet balances for every chain the wallet has an address
// for. Same public RPCs as one-ie's own reader — no API key required.
export async function fetchSelfHostedBalances(wallet: SelfHostedWallet): Promise<ChainBalance[]> {
  const out: ChainBalance[] = []
  if (wallet.sui) out.push({ chain: 'sui', address: wallet.sui, balance: await getSuiBalance(wallet.sui, SUI_RPC) })
  if (wallet.evm) out.push({ chain: 'evm', address: wallet.evm, balance: await getEthBalance(wallet.evm, ETH_RPC) })
  if (wallet.sol) out.push({ chain: 'sol', address: wallet.sol, balance: await getSolBalance(wallet.sol, SOL_RPC) })
  if (wallet.btc) out.push({ chain: 'btc', address: wallet.btc, balance: await getBtcBalance(wallet.btc, BTC_API) })
  return out
}
