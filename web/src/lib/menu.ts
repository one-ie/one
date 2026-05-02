import {
  Home,
  MessageSquare,
  Palette,
  Zap,
  type LucideIcon,
} from 'lucide-react'

export interface SubMenuItem {
  href: string
  label: string
}

export interface MenuItem {
  href: string
  label: string
  icon: LucideIcon
  submenus?: SubMenuItem[]
}

export interface MenuGroup {
  label: string | null
  items: MenuItem[]
}

export function getMenu(): MenuGroup[] {
  return [
    {
      label: null,
      items: [
        { href: '/', label: 'Home', icon: Home },
        { href: '/chat', label: 'Chat', icon: MessageSquare },
        { href: '/design', label: 'Design', icon: Palette },
        { href: '/motion', label: 'Motion', icon: Zap },
      ],
    },
  ]
}

export function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}
