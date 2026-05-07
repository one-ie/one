import * as React from "react"
import { Drawer } from "@/components/ui/Drawer"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { emitClick } from "@/lib/ui-signal"

// ── Types ────────────────────────────────────────────────────────────────────

export interface AgentDrawerProps {
  agentId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface AgentDefinition {
  name: string
  slug: string
  state: string
  frontmatter: Record<string, unknown>
  body: string
}

interface GenerationEntry {
  generation: number
  reason: string
  createdAt?: string
}

type TabKey =
  | "definition"
  | "chats"
  | "trace"
  | "revenue"
  | "generations"
  | "connect"

const TAB_LABELS: Record<TabKey, string> = {
  definition: "Definition",
  chats: "Chats",
  trace: "Trace",
  revenue: "Revenue",
  generations: "Generations",
  connect: "Connect",
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function StateBadge({ state }: { state: string }) {
  const colors: Record<string, string> = {
    active: "bg-tertiary text-on-tertiary",
    inactive: "bg-foreground text-font/60",
    draft: "bg-secondary text-on-secondary",
  }
  const cls = colors[state] ?? "bg-foreground text-font/60"
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}
    >
      {state}
    </span>
  )
}

function TabError({ message }: { message: string }) {
  return <p className="text-font/60 text-sm">{message}</p>
}

function TabSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-4 rounded bg-foreground animate-pulse"
          style={{ width: `${60 + i * 10}%` }}
        />
      ))}
    </div>
  )
}

// ── Tab content components ────────────────────────────────────────────────────

function DefinitionTab({ agentId }: { agentId: string }) {
  const [data, setData] = React.useState<AgentDefinition | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(`/api/agents/${agentId}`)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
        return r.json() as Promise<AgentDefinition>
      })
      .then((d) => { if (!cancelled) { setData(d); setLoading(false) } })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load agent")
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [agentId])

  if (loading) return <TabSkeleton />
  if (error) return <TabError message={`Could not load definition: ${error}`} />
  if (!data) return null

  return (
    <div className="flex flex-col gap-4">
      {/* Name + state */}
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold text-font">{data.name}</h2>
        <StateBadge state={data.state} />
      </div>

      {/* Slug */}
      <p className="text-sm text-font/60">
        <span className="font-medium text-font">Slug:</span>{" "}
        <span className="font-mono">{data.slug}</span>
      </p>

      {/* Frontmatter */}
      <div
        className="rounded-xl bg-foreground p-4 border"
        style={{ borderColor: "var(--color-border)" }}
      >
        <p className="text-xs font-medium text-font/60 mb-2 uppercase tracking-wide">
          Frontmatter
        </p>
        <pre className="text-xs text-font font-mono whitespace-pre-wrap break-all overflow-auto">
          {JSON.stringify(data.frontmatter, null, 2)}
        </pre>
      </div>

      {/* Body */}
      {data.body && (
        <div
          className="rounded-xl bg-foreground p-4 border"
          style={{ borderColor: "var(--color-border)" }}
        >
          <p className="text-xs font-medium text-font/60 mb-2 uppercase tracking-wide">
            Body
          </p>
          <p className="text-sm text-font whitespace-pre-wrap">{data.body}</p>
        </div>
      )}
    </div>
  )
}

function ChatsTab({ agentId }: { agentId: string }) {
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(`/api/agents/${agentId}/chats`)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
        return r.json()
      })
      .then(() => { if (!cancelled) setLoading(false) })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load chats")
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [agentId])

  if (loading) return <TabSkeleton />
  if (error) return <TabError message={`Could not load chats: ${error}`} />

  return (
    <div
      className="rounded-xl bg-foreground p-4 border"
      style={{ borderColor: "var(--color-border)" }}
    >
      <p className="text-sm text-font/60">No chats yet</p>
    </div>
  )
}

function TraceTab({ agentId }: { agentId: string }) {
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(`/api/agents/${agentId}/trace`)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
        return r.json()
      })
      .then(() => { if (!cancelled) setLoading(false) })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load trace")
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [agentId])

  if (loading) return <TabSkeleton />
  if (error) return <TabError message={`Could not load trace: ${error}`} />

  return (
    <div
      className="rounded-xl bg-foreground p-4 border"
      style={{ borderColor: "var(--color-border)" }}
    >
      <p className="text-sm text-font/60">No trace data yet</p>
    </div>
  )
}

function RevenueTab({ agentId }: { agentId: string }) {
  const [total, setTotal] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(`/api/agents/${agentId}/revenue`)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
        return r.json() as Promise<{ total?: number | string }>
      })
      .then((d) => {
        if (!cancelled) {
          setTotal(d.total != null ? String(d.total) : "0")
          setLoading(false)
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load revenue")
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [agentId])

  if (loading) return <TabSkeleton />
  if (error) return <TabError message={`Could not load revenue: ${error}`} />

  return (
    <div
      className="rounded-xl bg-foreground p-4 border"
      style={{ borderColor: "var(--color-border)" }}
    >
      <p className="text-sm text-font/60">
        Total:{" "}
        <span className="font-semibold text-font">${total ?? "0"}</span>
      </p>
    </div>
  )
}

function GenerationsTab({ agentId }: { agentId: string }) {
  const [entries, setEntries] = React.useState<GenerationEntry[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(`/api/agents/${agentId}/generations`)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
        return r.json() as Promise<GenerationEntry[]>
      })
      .then((d) => {
        if (!cancelled) {
          setEntries(Array.isArray(d) ? d : [])
          setLoading(false)
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load generations")
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [agentId])

  if (loading) return <TabSkeleton />
  if (error) return <TabError message={`Could not load generations: ${error}`} />

  if (entries.length === 0) {
    return (
      <div
        className="rounded-xl bg-foreground p-4 border"
        style={{ borderColor: "var(--color-border)" }}
      >
        <p className="text-sm text-font/60">No generations yet</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry) => (
        <div
          key={entry.generation}
          className="rounded-xl bg-foreground p-4 border flex items-start justify-between gap-3"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-font/60 uppercase tracking-wide">
              Generation {entry.generation}
            </span>
            <span className="text-sm text-font">{entry.reason}</span>
          </div>
          {entry.createdAt && (
            <span className="text-xs text-font/40 shrink-0">
              {new Date(entry.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

const STATIC_TOOLS = [
  { id: "typedb", name: "TypeDB", description: "Brain — paths, classification, learning" },
  { id: "d1", name: "D1 Database", description: "Signals and messages storage" },
  { id: "kv", name: "KV Store", description: "Snapshots and caching" },
  { id: "mcp", name: "MCP Server", description: "Model Context Protocol tools" },
  { id: "webhook", name: "Webhooks", description: "Outbound HTTP event delivery" },
]

function ConnectTab({ agentId }: { agentId: string }) {
  return (
    <div className="flex flex-col gap-2">
      {STATIC_TOOLS.map((tool) => (
        <div
          key={tool.id}
          className="rounded-xl bg-foreground p-4 border flex items-center justify-between gap-3"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-font">{tool.name}</span>
            <span className="text-xs text-font/60">{tool.description}</span>
          </div>
          <a
            href={`/tools?agent=${agentId}&tool=${tool.id}`}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-medium hover:brightness-110 transition-all"
            onClick={() =>
              emitClick("ui:agent-drawer:connect", { agentId, tool: tool.id })
            }
          >
            Connect
          </a>
        </div>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function AgentDrawer({ agentId, open, onOpenChange }: AgentDrawerProps) {
  const [activeTab, setActiveTab] = React.useState<TabKey>("definition")
  // Track which tabs have ever been activated so we only mount fetch once
  const [loadedTabs, setLoadedTabs] = React.useState<Set<TabKey>>(
    new Set(["definition"])
  )

  // Re-fetch definition tab when this agent is patched via chat
  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ id: string }>).detail
      if (detail?.id === agentId) {
        setLoadedTabs(prev => { const s = new Set(prev); s.delete('definition'); return s })
      }
    }
    window.addEventListener('agent:patched', handler)
    return () => window.removeEventListener('agent:patched', handler)
  }, [agentId])

  const handleTabChange = (value: string) => {
    const tab = value as TabKey
    setActiveTab(tab)
    setLoadedTabs((prev) => new Set([...prev, tab]))
    emitClick("ui:agent-drawer:tab", { tab })
  }

  return (
    <Drawer
      id={`agent-${agentId}`}
      open={open}
      onOpenChange={onOpenChange}
      title="Agent"
      description={agentId}
    >
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        {/* Tab bar */}
        <TabsList className="w-full mb-4">
          {(Object.keys(TAB_LABELS) as TabKey[]).map((key) => (
            <TabsTrigger key={key} value={key} className="flex-1 text-xs">
              {TAB_LABELS[key]}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab panels — only render content once the tab has been activated */}
        <TabsContent value="definition">
          {loadedTabs.has("definition") && (
            <DefinitionTab agentId={agentId} />
          )}
        </TabsContent>

        <TabsContent value="chats">
          {loadedTabs.has("chats") && <ChatsTab agentId={agentId} />}
        </TabsContent>

        <TabsContent value="trace">
          {loadedTabs.has("trace") && <TraceTab agentId={agentId} />}
        </TabsContent>

        <TabsContent value="revenue">
          {loadedTabs.has("revenue") && <RevenueTab agentId={agentId} />}
        </TabsContent>

        <TabsContent value="generations">
          {loadedTabs.has("generations") && (
            <GenerationsTab agentId={agentId} />
          )}
        </TabsContent>

        <TabsContent value="connect">
          {loadedTabs.has("connect") && <ConnectTab agentId={agentId} />}
        </TabsContent>
      </Tabs>
    </Drawer>
  )
}
