import { useEffect } from 'react'
import { X, Menu as MenuIcon } from 'lucide-react'
import { Icon } from '@/components/ui/Icon'
import { emitClick } from '@/lib/ui-signal'
import { getMenu, isActive, type MenuGroup } from '@/lib/menu'
import { MenuItemNode } from './MenuItem'
import { AuthButton } from '@/components/auth/AuthButton'

interface Props {
  pathname: string
  groups?: MenuGroup[]
  profileLogo?: string
  profileName?: string
  profileSlug?: string
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export function SheetMenu({ pathname, groups: groupsProp, profileLogo, profileName, profileSlug, isOpen, onOpen, onClose }: Props) {
  const groups: MenuGroup[] = groupsProp ?? getMenu()

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen, onClose])

  return (
    <>
      <button
        type="button"
        onClick={() => {
          emitClick('ui:sidebar:sheet', { open: true })
          onOpen()
        }}
        aria-label="Open menu"
        className="fixed top-4 left-4 z-30 flex h-10 w-10 items-center justify-center rounded-lg bg-background text-font shadow-md md:hidden"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <Icon icon={MenuIcon} size="lg" />
      </button>

      <div
        onClick={() => {
          emitClick('ui:sidebar:sheet', { open: false })
          onClose()
        }}
        aria-hidden
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity md:hidden"
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      />

      <aside
        aria-label="Sidebar"
        className="fixed top-0 left-0 z-50 flex h-full w-72 flex-col bg-background transition-transform md:hidden"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        <header className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <a href={profileSlug ? `/u/${profileSlug}` : '/'} className="flex items-center gap-2 text-lg font-bold tracking-tight min-w-0">
            {profileLogo && (
              <img src={profileLogo} alt="" aria-hidden width={28} height={28} className="rounded-md shrink-0 object-contain" />
            )}
            <span className="truncate" data-brand-label data-brand-default={profileSlug ? `@${profileSlug}` : 'ONE'}>{profileName ?? (profileSlug ? `@${profileSlug}` : 'ONE')}</span>
          </a>
          <button
            type="button"
            onClick={() => {
              emitClick('ui:sidebar:sheet', { open: false })
              onClose()
            }}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-font/60 hover:bg-foreground hover:text-font"
          >
            <Icon icon={X} size="md" />
          </button>
        </header>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((g, i) => (
            <div key={i} className="mb-4">
              {g.label && (
                <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-font/60">
                  {g.label}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {g.items.map((item) => (
                  <MenuItemNode
                    key={item.href + item.label}
                    item={item}
                    pathname={pathname}
                    open={true}
                    onExpandSidebar={() => {}}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
        <footer className="px-3 pb-4 pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
          <AuthButton open={true} />
        </footer>
      </aside>
    </>
  )
}

export { isActive }
