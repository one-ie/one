// Ported from one.ie/web/src/components/cro/FooterSection.tsx — hrefs additionally
// wrapped in safeHref() (see ../lib/safe-url.ts): public, no-login render surface.
import { AtSign, Globe, MessageCircle, Share2 } from 'lucide-react'
import { Separator } from './Separator'
import { safeHref } from '../lib/safe-url'

export interface FooterLink {
  label: string
  href: string
}

export interface FooterSocial {
  platform: 'facebook' | 'instagram' | 'twitter' | 'youtube'
  href: string
}

export interface FooterSectionProps {
  brand?: string
  links?: FooterLink[]
  socials?: FooterSocial[]
  copyright?: string
}

// lucide dropped brand glyphs (Facebook/Twitter/…); map platforms to generic icons.
const ICONS = {
  facebook: Globe,
  instagram: AtSign,
  twitter: MessageCircle,
  youtube: Share2,
} as const

export function FooterSection({
  brand = 'ONE',
  links = [],
  socials = [],
  copyright = `©${new Date().getFullYear()} ONE, Made for better web.`,
}: FooterSectionProps) {
  return (
    <footer>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 max-md:flex-col sm:px-6 sm:py-6 md:gap-6 md:py-8">
        <a href="#" className="flex items-center gap-3 font-semibold text-lg">
          {brand}
        </a>

        <nav className="flex items-center gap-5 whitespace-nowrap">
          {links.map((link, i) => (
            <a key={i} href={safeHref(link.href) ?? '#'} className="hover:underline">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {socials.map((social, i) => {
            const IconCmp = ICONS[social.platform] ?? Globe
            return (
              <a key={i} href={safeHref(social.href) ?? '#'} aria-label={social.platform}>
                <IconCmp className="size-5" />
              </a>
            )
          })}
        </div>
      </div>

      <Separator />

      <div className="mx-auto flex max-w-7xl justify-center px-4 py-8 sm:px-6">
        <p className="text-center font-medium text-balance">{copyright}</p>
      </div>
    </footer>
  )
}
