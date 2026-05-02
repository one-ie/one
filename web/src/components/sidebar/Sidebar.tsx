import { useEffect, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { emitClick } from '@/lib/ui-signal'
import { useSidebar, usePathname, useMediaQuery } from '@/hooks/use-sidebar'
import { getMenu } from '@/lib/menu'
import { MenuItemNode } from './MenuItem'
import { SheetMenu } from './SheetMenu'

interface Props {
  initial: 'mini' | 'full'
}

export function Sidebar({ initial }: Props) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const { open, toggle, set } = useSidebar(initial === 'full')
  const pathname = usePathname()
  const [sheetOpen, setSheetOpen] = useState(false)
  const groups = getMenu()

  useEffect(() => {
    document.body.dataset.sidebarOpen = String(open)
  }, [open])

  if (isMobile) {
    return (
      <SheetMenu
        pathname={pathname}
        isOpen={sheetOpen}
        onOpen={() => setSheetOpen(true)}
        onClose={() => setSheetOpen(false)}
      />
    )
  }

  return (
    <aside
      aria-label="Sidebar"
      className={cn(
        'sticky top-0 z-30 flex h-screen flex-col bg-background',
        'transition-[width] duration-200',
      )}
      style={{
        width: open ? 240 : 72,
        borderRight: '1px solid var(--color-border)',
      }}
    >
      <header className={cn('flex items-center px-4 py-5', !open && 'justify-center px-0')}>
        <a
          href="/"
          onClick={() => emitClick('ui:sidebar:nav', { href: '/', source: 'brand' })}
          className="flex items-center gap-2 text-lg font-bold tracking-tight"
        >
          <img src="/icon.svg" alt="" aria-hidden width={40} height={40} className="rounded-lg" />
          {open && <span>ONE</span>}
        </a>
      </header>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {groups.map((g, i) => (
          <div key={i} className="mb-4">
            {g.label && open && (
              <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-font/40">
                {g.label}
              </p>
            )}
            {g.label && !open && (
              <div
                className="mx-auto mb-2 h-px w-6"
                style={{ background: 'var(--color-border)' }}
                aria-hidden
              />
            )}
            <div className="flex flex-col gap-0.5">
              {g.items.map((item) => (
                <MenuItemNode
                  key={item.href + item.label}
                  item={item}
                  pathname={pathname}
                  open={open}
                  onExpandSidebar={() => set(true)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <button
        type="button"
        onClick={toggle}
        aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
        className={cn(
          'absolute top-6 -right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full',
          'bg-background text-font/60 hover:text-font',
        )}
        style={{
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-card)',
          transition: 'transform var(--ease), color var(--ease)',
        }}
      >
        <Icon
          icon={ChevronLeft}
          size="sm"
          className={cn('transition-transform', !open && 'rotate-180')}
        />
      </button>
    </aside>
  )
}
