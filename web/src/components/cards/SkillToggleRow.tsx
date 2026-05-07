import { emitClick } from '@/lib/ui-signal'
import type { CardProps } from '@/lib/cards'
import { Switch } from '@/components/ui/switch'

type SkillToggleData = Extract<CardProps['data'], { kind: 'skill-toggle' }>

export function SkillToggleRow({ data, onAction }: CardProps) {
  const d = data as SkillToggleData

  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3 bg-background rounded-xl border"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-medium text-font truncate">{d.name}</span>
        {d.description && (
          <span className="text-xs text-font/60 truncate">{d.description}</span>
        )}
      </div>
      <Switch
        checked={d.enabled}
        onCheckedChange={() => {
          emitClick('ui:card:skill-toggle:toggle')
          onAction('toggle', { id: d.id, enabled: !d.enabled })
        }}
      />
    </div>
  )
}
