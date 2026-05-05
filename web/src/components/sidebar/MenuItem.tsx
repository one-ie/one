import { useState } from 'react'
import { ChevronDown, type LucideIcon } from 'lucide-react'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { emitClick } from '@/lib/ui-signal'
import { isActive, type MenuItem as MenuItemType, type SubMenuItem } from '@/lib/menu'

interface RowProps {
  href: string
  label: string
  icon?: LucideIcon
  active: boolean
  open: boolean
  indent?: boolean
}

function Row({ href, label, icon, active, open, indent }: RowProps) {
  return (
    <a
      href={href}
      title={open ? undefined : label}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm',
        'text-font/60 hover:bg-foreground/60 hover:text-font',
        active && 'bg-primary text-on-primary font-medium hover:bg-primary hover:text-on-primary',
        indent && 'pl-9',
        !open && 'justify-center px-0',
      )}
      style={{ transition: 'background-color var(--ease), color var(--ease)' }}
    >
      {icon && <Icon icon={icon} size={open ? 'md' : 'lg'} />}
      <span
        className={cn(
          'truncate',
          !open && 'sr-only',
        )}
      >
        {label}
      </span>
    </a>
  )
}

interface CollapseProps {
  item: MenuItemType
  pathname: string
  open: boolean
  onExpandSidebar: () => void
}

function Collapse({ item, pathname, open, onExpandSidebar }: CollapseProps) {
  const submenus = item.submenus ?? []
  const groupActive = submenus.some((s) => isActive(pathname, s.href))
  const [expanded, setExpanded] = useState(groupActive)

  const handleToggle = () => {
    if (!open) {
      onExpandSidebar()
      setExpanded(true)
      emitClick('ui:sidebar:expand', { group: item.label })
      return
    }
    const next = !expanded
    setExpanded(next)
    emitClick(next ? 'ui:sidebar:expand' : 'ui:sidebar:collapse', { group: item.label })
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleToggle}
        title={open ? undefined : item.label}
        className={cn(
          'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm',
          'text-font/60 hover:bg-foreground/60 hover:text-font',
          groupActive && 'text-font',
          !open && 'justify-center px-0',
        )}
        style={{ transition: 'background-color var(--ease), color var(--ease)' }}
      >
        <Icon icon={item.icon} size={open ? 'md' : 'lg'} />
        {open && (
          <>
            <span className="flex-1 truncate text-left">{item.label}</span>
            <Icon
              icon={ChevronDown}
              size="sm"
              className={cn(
                'transition-transform',
                expanded && 'rotate-180',
              )}
            />
          </>
        )}
      </button>
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-200',
          expanded && open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="mt-1 flex flex-col gap-0.5">
            {submenus.map((s: SubMenuItem) => (
              <Row
                key={s.href}
                href={s.href}
                label={s.label}
                active={isActive(pathname, s.href)}
                open={open}
                indent
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface Props {
  item: MenuItemType
  pathname: string
  open: boolean
  onExpandSidebar: () => void
}

export function MenuItemNode({ item, pathname, open, onExpandSidebar }: Props) {
  if (item.submenus && item.submenus.length > 0) {
    return <Collapse item={item} pathname={pathname} open={open} onExpandSidebar={onExpandSidebar} />
  }
  return (
    <Row
      href={item.href}
      label={item.label}
      icon={item.icon}
      active={isActive(pathname, item.href)}
      open={open}
    />
  )
}
