import {
  LayoutDashboard,
  MessageSquare,
  Wallet,
  Settings,
  ShoppingCart,
  Tag,
  Users,
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
        { href: '/', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/chat', label: 'Chat', icon: MessageSquare },
      ],
    },
    {
      label: 'Money',
      items: [
        {
          href: '/wallet',
          label: 'Wallet',
          icon: Wallet,
          submenus: [
            { href: '/wallet', label: 'Balance' },
            { href: '/wallet/activity', label: 'Activity' },
          ],
        },
        { href: '/buy', label: 'Buy', icon: ShoppingCart },
        { href: '/sell', label: 'Sell', icon: Tag },
      ],
    },
    {
      label: 'Account',
      items: [
        { href: '/users', label: 'Team', icon: Users },
        { href: '/settings', label: 'Settings', icon: Settings },
      ],
    },
  ]
}

export function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}
