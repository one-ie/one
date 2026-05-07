import { useEffect, useState } from 'react'
import { Drawer } from '@/components/ui/Drawer'
import { emitClick } from '@/lib/ui-signal'
import type { AgentMeta } from '@/lib/agents-meta'

interface Props {
  agents: AgentMeta[]
}

export function AgentPageClient({ agents }: Props) {
  // Track which drawer is open (controlled mode)
  const [openId, setOpenId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return new URLSearchParams(window.location.search).get('drawer')
  })

  useEffect(() => {
    // Listen for clicks on the static "Details" buttons (dispatched by the
    // inline <script> in agents.astro after pushState)
    const handleOpen = (e: Event) => {
      const id = (e as CustomEvent<{ id: string }>).detail?.id
      if (id) setOpenId(id)
    }

    // Also sync on browser back/forward navigation
    const handlePop = () => {
      const id = new URLSearchParams(window.location.search).get('drawer')
      setOpenId(id)
    }

    window.addEventListener('drawer:open', handleOpen)
    window.addEventListener('popstate', handlePop)
    return () => {
      window.removeEventListener('drawer:open', handleOpen)
      window.removeEventListener('popstate', handlePop)
    }
  }, [])

  const handleOpenChange = (agentId: string) => (next: boolean) => {
    setOpenId(next ? agentId : null)
  }

  return (
    <>
      {agents.map((agent) => (
        <Drawer
          key={agent.id}
          id={agent.id}
          open={openId === agent.id}
          onOpenChange={handleOpenChange(agent.id)}
          title={agent.title}
          description={agent.description}
          footer={
            <a
              href={agent.id === agents[0]?.id ? '/chat' : `/chat?agent=${agent.id}`}
              className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium hover:brightness-110"
              style={{ transitionDuration: '120ms' }}
              onClick={() => emitClick('ui:agents:chat', { agentId: agent.id })}
            >
              Chat with {agent.title} →
            </a>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary text-on-primary text-base font-bold shrink-0">
                {agent.title.slice(0, 1).toUpperCase()}
              </span>
              <div>
                <p className="font-semibold text-base">{agent.title}</p>
                <p className="text-sm text-font/60">{agent.name}</p>
              </div>
            </div>

            <div
              className="p-4 bg-foreground rounded-xl border"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <p className="text-sm text-font/60">{agent.description}</p>
            </div>

            {agent.starters.length > 0 && (
              <div>
                <p className="text-xs font-medium text-font/60 mb-2 uppercase tracking-wide">
                  Conversation starters
                </p>
                <ul className="space-y-2">
                  {agent.starters.map((s, i) => (
                    <li
                      key={i}
                      className="text-sm text-font/70 flex items-start gap-2 p-3 bg-foreground rounded-lg border"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      <span className="mt-0.5 shrink-0 text-primary">›</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div
              className="p-3 bg-foreground rounded-lg border"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <p className="text-xs text-font/40 font-mono">id: {agent.id}</p>
            </div>
          </div>
        </Drawer>
      ))}
    </>
  )
}
