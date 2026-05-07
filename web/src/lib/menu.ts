import {
  MessageSquare,
  Bot,
  Zap,
  Wrench,
  CreditCard,
  Palette,
  Settings,
  User,
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
  exact?: boolean
  submenus?: SubMenuItem[]
  viewer?: ('creator' | 'developer' | 'end_user')[]
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
        { href: '/chat',     label: 'Chat',     icon: MessageSquare },
        { href: '/agents',   label: 'Agents',   icon: Bot },
        { href: '/skills',   label: 'Skills',   icon: Zap,        viewer: ['developer', 'creator'] },
        { href: '/tools',    label: 'Tools',    icon: Wrench,     viewer: ['developer', 'creator'] },
        { href: '/payments', label: 'Payments', icon: CreditCard, viewer: ['developer', 'creator'] },
        { href: '/design',   label: 'Design',   icon: Palette,    viewer: ['developer', 'creator'] },
        { href: '/settings', label: 'Settings', icon: Settings,   viewer: ['developer', 'creator'] },
      ],
    },
  ]
}

export function getUserMenu(slug: string): MenuGroup[] {
  const base = `/u/${slug}`
  return [
    {
      label: null,
      items: [
        { href: base,               label: `@${slug}`,  icon: User,          exact: true },
        { href: `${base}/chat`,     label: 'Chat',       icon: MessageSquare },
        { href: `${base}/agent`,    label: 'Agents',     icon: Bot },
        { href: `${base}/skill`,    label: 'Skills',     icon: Zap },
        { href: `${base}/tool`,     label: 'Tools',      icon: Wrench },
        { href: `${base}/settings`, label: 'Settings',   icon: Settings },
      ],
    },
  ]
}

export function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact || href === '/') return pathname === href
  return pathname === href || pathname.startsWith(href + '/')
}
