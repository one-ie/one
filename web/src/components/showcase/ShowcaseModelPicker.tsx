import { useEffect, useMemo, useState } from 'react'
import { ChevronsUpDown, Sparkles } from 'lucide-react'
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorName,
  ModelSelectorTrigger,
} from '@/components/ai-elements/model-selector'
import { emitClick } from '@/lib/ui-signal'

interface ORModel {
  id: string
  name: string
  description?: string
  context?: number
  promptPrice?: string
  completionPrice?: string
}

interface Props {
  value: string
  onChange: (id: string) => void
}

const FEATURED_PREFIXES = [
  'openai/',
  'anthropic/',
  'google/',
  'meta-llama/',
  'mistralai/',
  'deepseek/',
  'x-ai/',
]

function provider(id: string): string {
  return id.split('/')[0] ?? 'other'
}

function shortName(m: ORModel): string {
  const after = m.name.includes(':') ? m.name.split(':').slice(1).join(':').trim() : m.name
  return after || m.id
}

function priceLabel(m: ORModel): string | null {
  const p = parseFloat(m.promptPrice ?? '')
  if (Number.isNaN(p)) return null
  if (p === 0) return 'free'
  return `$${(p * 1_000_000).toFixed(2)}/M in`
}

export function ShowcaseModelPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [models, setModels] = useState<ORModel[] | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || models) return
    setLoading(true)
    fetch('/api/openrouter-models')
      .then((r) => (r.ok ? r.json() : { models: [] }))
      .then((j: { models?: ORModel[] }) => setModels(j.models ?? []))
      .catch(() => setModels([]))
      .finally(() => setLoading(false))
  }, [open, models])

  const selected = models?.find((m) => m.id === value)
  const label = selected ? shortName(selected) : value.split('/').slice(-1)[0]

  const grouped = useMemo(() => {
    if (!models) return { featured: [], rest: new Map<string, ORModel[]>() }
    const featured = models.filter((m) => FEATURED_PREFIXES.includes(provider(m.id) + '/'))
    const rest = new Map<string, ORModel[]>()
    for (const m of models) {
      if (FEATURED_PREFIXES.includes(provider(m.id) + '/')) continue
      const k = provider(m.id)
      const arr = rest.get(k) ?? []
      arr.push(m)
      rest.set(k, arr)
    }
    return { featured, rest }
  }, [models])

  return (
    <>
      <style>{`
        .model-picker-content,
        .model-picker-content *,
        .model-picker-content *:focus,
        .model-picker-content *:focus-visible,
        .model-picker-content *:focus-within {
          outline: none !important;
          box-shadow: none !important;
        }
        .model-picker-content [data-slot="input-group"] {
          border-color: var(--color-border) !important;
          box-shadow: none !important;
        }
      `}</style>
    <ModelSelector open={open} onOpenChange={setOpen}>
      <ModelSelectorTrigger asChild>
        <button
          type="button"
          onClick={() => emitClick('ui:showcase:model-open')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-foreground hover:bg-background border transition"
          style={{ borderColor: 'var(--color-border)' }}
          aria-label="Choose model"
        >
          <Sparkles className="size-3.5 text-primary" />
          <span className="max-w-[140px] truncate">{label}</span>
          <ChevronsUpDown className="size-3 text-font/60" />
        </button>
      </ModelSelectorTrigger>
      <ModelSelectorContent
        title="Choose a model"
        className="model-picker-content bg-background text-font [&_[data-slot=command-group]]:text-font [&_[data-slot=command-item]]:text-font [&_[cmdk-group-heading]]:text-font/60 [&_[data-slot=command-item][data-selected=true]]:bg-foreground [&_[data-slot=command-item][data-selected=true]]:text-font"
      >
        <ModelSelectorInput placeholder={loading ? 'Loading…' : 'Search OpenRouter models…'} />
        <ModelSelectorList>
          <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
          {grouped.featured.length > 0 && (
            <ModelSelectorGroup heading="Featured">
              {grouped.featured.map((m) => (
                <ModelSelectorItem
                  key={m.id}
                  value={`${m.id} ${m.name}`}
                  onSelect={() => {
                    emitClick('ui:showcase:model-select', { model: m.id })
                    onChange(m.id)
                    setOpen(false)
                  }}
                >
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <ModelSelectorName>{shortName(m)}</ModelSelectorName>
                    <span className="text-[10px] text-font/50 truncate">{m.id}</span>
                  </div>
                  {priceLabel(m) && (
                    <span className="text-[10px] text-font/50 ml-2">{priceLabel(m)}</span>
                  )}
                </ModelSelectorItem>
              ))}
            </ModelSelectorGroup>
          )}
          {[...grouped.rest.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([prov, list]) => (
              <ModelSelectorGroup key={prov} heading={prov}>
                {list.map((m) => (
                  <ModelSelectorItem
                    key={m.id}
                    value={`${m.id} ${m.name}`}
                    onSelect={() => {
                      emitClick('ui:showcase:model-select', { model: m.id })
                      onChange(m.id)
                      setOpen(false)
                    }}
                  >
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <ModelSelectorName>{shortName(m)}</ModelSelectorName>
                      <span className="text-[10px] text-font/50 truncate">{m.id}</span>
                    </div>
                    {priceLabel(m) && (
                      <span className="text-[10px] text-font/50 ml-2">{priceLabel(m)}</span>
                    )}
                  </ModelSelectorItem>
                ))}
              </ModelSelectorGroup>
            ))}
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
    </>
  )
}
