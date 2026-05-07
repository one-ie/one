import { useEffect, useState } from 'react'
import { emitClick } from '@/lib/ui-signal'
import { SkillToggleRow } from '@/components/cards/SkillToggleRow'
import { EmptyStateCard } from '@/components/cards/EmptyStateCard'
import { ChatDock } from '@/components/chat/ChatDock'
import { Spinner } from '@/components/ui/spinner'
import type { CardData } from '@/lib/cards'

interface Skill {
  name: string
  enabled: boolean
  description?: string
}

interface SkillsResponse {
  skills: Skill[]
}

type FetchState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'unauthorized' }
  | { status: 'ok'; skills: Skill[] }

export function SkillsView() {
  const [state, setState] = useState<FetchState>({ status: 'loading' })

  useEffect(() => {
    emitClick('ui:skills:view')

    const controller = new AbortController()

    fetch('/api/skills', { signal: controller.signal })
      .then(async res => {
        if (res.status === 401) {
          setState({ status: 'unauthorized' })
          return
        }
        if (!res.ok) {
          const body = await res.json().catch(() => ({})) as { error?: string }
          setState({ status: 'error', message: body.error ?? `HTTP ${res.status}` })
          return
        }
        const data = await res.json() as SkillsResponse
        setState({ status: 'ok', skills: data.skills ?? [] })
      })
      .catch(err => {
        if ((err as Error).name === 'AbortError') return
        setState({ status: 'error', message: (err as Error).message })
      })

    return () => controller.abort()
  }, [])

  const handleToggle = (id: string, enabled: boolean) => {
    if (state.status !== 'ok') return
    emitClick('ui:skills:toggle', { id, enabled })
    setState({
      status: 'ok',
      skills: state.skills.map(s =>
        s.name === id ? { ...s, enabled } : s
      ),
    })
  }

  if (state.status === 'unauthorized') {
    return (
      <div className="flex flex-col gap-8 p-6 max-w-2xl">
        <article
          className="bg-background border rounded-2xl flex flex-col gap-4 p-8 text-center items-center"
          style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
        >
          <p className="text-font/60 text-sm">Sign in to manage your skills.</p>
          <div className="flex gap-3">
            <a
              href="/get-yours"
              className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium"
            >
              Create space
            </a>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg border text-font text-sm"
              style={{ borderColor: 'var(--color-border)' }}
            >
              I've signed in
            </button>
          </div>
          <p className="text-xs text-font/40">Use the Sign in button in the sidebar.</p>
        </article>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-6 max-w-2xl">

      {/* Your skills */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-font/60">
          Your skills
        </h2>

        {state.status === 'loading' && (
          <div className="flex items-center justify-center py-10">
            <Spinner className="size-5 text-font/40" />
          </div>
        )}

        {state.status === 'error' && (
          <p className="text-sm text-font/60 py-4">
            Could not load skills: {state.message}
          </p>
        )}

        {state.status === 'ok' && state.skills.length === 0 && (
          <EmptyStateCard
            surface="skills"
            data={{ kind: 'empty-state', title: 'No skills yet', hint: 'Install a skill to get started.' } satisfies CardData}
            onAction={() => emitClick('ui:skills:empty-cta')}
          />
        )}

        {state.status === 'ok' && state.skills.length > 0 && (
          <div className="flex flex-col gap-2">
            {state.skills.map(skill => (
              <SkillToggleRow
                key={skill.name}
                surface="skills"
                data={{
                  kind: 'skill-toggle',
                  id: skill.name,
                  name: skill.name,
                  enabled: skill.enabled,
                  description: skill.description,
                } satisfies CardData}
                onAction={(action, payload) => {
                  if (action === 'toggle' && payload != null) {
                    const p = payload as { id: string; enabled: boolean }
                    handleToggle(p.id, p.enabled)
                  }
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Available */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-font/60">
          Available
        </h2>
        <EmptyStateCard
          surface="skills"
          data={{ kind: 'empty-state', title: 'More skills coming soon', hint: 'New agent capabilities will appear here.' } satisfies CardData}
          onAction={() => emitClick('ui:skills:marketplace-cta')}
        />
      </section>

      <ChatDock surface="skills" />
    </div>
  )
}
