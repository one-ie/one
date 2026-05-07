import { useEffect, useState } from 'react'
import { emitClick } from '@/lib/ui-signal'
import { ChatDock } from '@/components/chat/ChatDock'
import type { ToolConnection } from '@/lib/db/tools'

interface PlatformTool {
  name: string
  description: string
  status: 'active' | 'roadmap'
}

const PLATFORM_TOOLS: PlatformTool[] = [
  { name: 'crawl', description: 'Fetch a URL and return markdown via Cloudflare Browser Rendering', status: 'active' },
  { name: 'image', description: 'Generate an image from a text prompt via Cloudflare Workers AI', status: 'active' },
  { name: 'search', description: 'Web search', status: 'roadmap' },
  { name: 'email', description: 'Send transactional email via Resend', status: 'roadmap' },
  { name: 'memory', description: 'Read and write from the agent KV store', status: 'roadmap' },
]

interface ToolsResponse {
  connected: ToolConnection[]
  available: string[]
}

interface ConnectResponse {
  ok: boolean
  redirectUrl: string
  connectionId: string
}

function authHeaders(): HeadersInit {
  const token = typeof localStorage !== 'undefined' ? (localStorage.getItem('token') ?? '') : ''
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

export function ToolsView() {
  const [connected, setConnected] = useState<ToolConnection[]>([])
  const [available, setAvailable] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    emitClick('ui:tools:view')
    void fetchTools()
  }, [])

  async function fetchTools() {
    setLoading(true)
    try {
      const res = await fetch('/api/tools', { headers: authHeaders() })
      if (res.status === 401) {
        setUnauthorized(true)
        return
      }
      const data = (await res.json()) as ToolsResponse
      setConnected(data.connected ?? [])
      setAvailable(data.available ?? [])
    } finally {
      setLoading(false)
    }
  }

  async function handleConnect(provider: string) {
    emitClick('ui:tools:connect', { provider })
    setBusy(provider)
    try {
      const res = await fetch(`/api/tools/${provider}/connect`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({}),
      })
      if (res.status === 401) {
        setUnauthorized(true)
        return
      }
      const data = (await res.json()) as ConnectResponse
      if (data.redirectUrl && data.redirectUrl !== '#stub') {
        window.location.href = data.redirectUrl
      } else {
        await fetchTools()
      }
    } finally {
      setBusy(null)
    }
  }

  async function handleDisconnect(connection: ToolConnection) {
    emitClick('ui:tools:disconnect', { provider: connection.provider })
    setBusy(connection.id)
    try {
      const res = await fetch(`/api/tools/${connection.provider}/disconnect`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ connectionId: connection.id }),
      })
      if (res.status === 401) {
        setUnauthorized(true)
        return
      }
      await fetchTools()
    } finally {
      setBusy(null)
    }
  }

  if (unauthorized) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div
          className="bg-background border rounded-2xl p-8 text-center"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <p className="text-font/60">Sign in to manage tools.</p>
        </div>
        <ChatDock surface="tools" />
      </main>
    )
  }

  const connectedProviders = new Set(connected.map((c) => c.provider))
  const unconnected = available.filter((p) => !connectedProviders.has(p))

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Tools</h1>
        <p className="text-font/60">Connect external services to your agents.</p>
      </div>

      {/* Platform tools zone */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-font/40 mb-4">
          Platform
        </h2>
        <div
          className="bg-background border rounded-2xl overflow-hidden"
          style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
        >
          <ul>
            {PLATFORM_TOOLS.map((tool, i) => (
              <li
                key={tool.name}
                className={`flex items-center justify-between gap-4 px-5 py-3 bg-foreground rounded-xl border m-3${i < PLATFORM_TOOLS.length - 1 ? ' mb-2' : ''}`}
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-medium">{tool.name}</span>
                  <span className="text-xs text-font/40 truncate">{tool.description}</span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${
                    tool.status === 'active'
                      ? 'bg-tertiary/20 text-tertiary'
                      : 'bg-foreground text-font/40 border'
                  }`}
                  style={tool.status !== 'active' ? { borderColor: 'var(--color-border)' } : undefined}
                >
                  {tool.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Connected zone */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-font/40 mb-4">
          Connected
        </h2>
        <div
          className="bg-background border rounded-2xl overflow-hidden"
          style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
        >
          {loading ? (
            <div className="p-6 text-font/40 text-sm">Loading…</div>
          ) : connected.length === 0 ? (
            <div className="p-6 text-font/40 text-sm">No tools connected yet.</div>
          ) : (
            <ul>
              {connected.map((conn, i) => (
                <li
                  key={conn.id}
                  className={`flex items-center justify-between gap-4 px-5 py-3 bg-foreground rounded-xl border m-3${i < connected.length - 1 ? ' mb-2' : ''}`}
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-medium capitalize">{conn.provider}</span>
                    {conn.account && conn.account !== 'pending' && (
                      <span className="text-xs text-font/40 truncate">{conn.account}</span>
                    )}
                    {conn.account === 'pending' && (
                      <span className="text-xs text-font/40">pending</span>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={busy === conn.id}
                    onClick={() => handleDisconnect(conn)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border text-font hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                    style={{ borderColor: 'var(--color-border)', transitionDuration: '120ms' }}
                  >
                    {busy === conn.id ? 'Disconnecting…' : 'Disconnect'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Available zone */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-font/40 mb-4">
          Available
        </h2>
        <div
          className="bg-background border rounded-2xl overflow-hidden"
          style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
        >
          {loading ? (
            <div className="p-6 text-font/40 text-sm">Loading…</div>
          ) : unconnected.length === 0 ? (
            <div className="p-6 text-font/40 text-sm">All available tools are connected.</div>
          ) : (
            <ul>
              {unconnected.map((provider, i) => (
                <li
                  key={provider}
                  className={`flex items-center justify-between gap-4 px-5 py-3 bg-foreground rounded-xl border m-3${i < unconnected.length - 1 ? ' mb-2' : ''}`}
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <span className="text-sm font-medium capitalize">{provider}</span>
                  <button
                    type="button"
                    disabled={busy === provider}
                    onClick={() => handleConnect(provider)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-on-primary hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-[filter] shrink-0"
                    style={{ transitionDuration: '120ms' }}
                  >
                    {busy === provider ? 'Connecting…' : 'Connect'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <ChatDock surface="tools" />
    </main>
  )
}
