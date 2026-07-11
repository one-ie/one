// Portable Puck block config for external sites. Unlike one.ie/web's
// lib/puck/config.tsx (176 blocks, most delegating to @/components/* imports and
// several to live D1/resolver reads), this config is SELF-CONTAINED: every block
// is copied verbatim into ./components with imports rewritten to local paths, so
// it builds and ships as an npm package with no workspace-internal dependency.
//
// Block KEYS match the real registry exactly (LandingHero, PricingSection, …) —
// C1 shipped 4 generic stub keys (Hero/Features/Pricing/Text) that never matched
// any real published page, so every real page rendered blank. C3 (2026-07-11)
// replaced that stub with this verified-portable subset: the 9 blocks confirmed,
// via a local D1 query, to be what real seeded pages (`beer`, `demo`, `oo-demo-*`)
// actually use.
//
// KNOWN LIMITATION (tracked in text/improvements.md): 176 blocks exist in the real
// registry; only these 9 ship here. The remaining ~167 either need substrate-live
// data (excluded by the promise's own "Out of scope" clause — chat/cart/storefront
// widgets, ProductBlock/RecordBlock/ViewBlock) or simply haven't been ported yet.
// A published page using an unregistered block type renders that block as nothing
// (Puck drops unknown types) — same distribution-lag limitation plugin-blog/
// plugin-docs already carry for their own registries.
//
// `fields` below are intentionally minimal (`{}`) — this package only ever calls
// Puck's read-only <Render>, which never consults `fields` (editor-only metadata).
// Field/defaultProps shapes are otherwise ported verbatim from the real registry
// for documentation parity.
import type { Config } from '@puckeditor/core'
import { LandingHero } from './components/LandingHero'
import { HowItWorks } from './components/HowItWorks'
import { LandingFeatures } from './components/LandingFeatures'
import { ProofBar } from './components/ProofBar'
import { SecondaryCTA } from './components/SecondaryCTA'
import { FAQSection } from './components/FAQSection'
import { Testimonials } from './components/Testimonials'
import { PricingSection } from './components/PricingSection'
import { FooterSection } from './components/FooterSection'

export const pagesPuckConfig: Config = {
  components: {
    LandingHero: {
      fields: {},
      defaultProps: {
        bgToken: 'none',
        headline: 'Build and sell smarter with AI agents',
        subhead: 'ONE connects your website, your audience, and your AI — so you can launch, grow, and earn without the usual overhead.',
        primaryCta: { label: 'Get started free', href: '#' },
        secondaryCta: { label: 'See how it works', href: '#how' },
      },
      render: (props: Record<string, unknown>) => (
        <LandingHero
          {...(props as any)}
          primaryCta={(props.primaryCta as any) ?? { label: 'Get started', href: '#' }}
          secondaryCta={(props.secondaryCta as any)?.label ? (props.secondaryCta as any) : undefined}
        />
      ),
    },

    ProofBar: {
      fields: {},
      defaultProps: {
        bgToken: 'none',
        stats: [
          { value: '12,000+', label: 'Businesses powered', source: '' },
          { value: '99.9%', label: 'Uptime SLA', source: '' },
          { value: '< 60s', label: 'Time to first agent', source: '' },
        ],
      },
      render: (props: Record<string, unknown>) => <ProofBar {...(props as any)} stats={(props.stats as any) ?? []} />,
    },

    HowItWorks: {
      fields: {},
      defaultProps: {
        bgToken: 'none',
        title: 'How it works',
        steps: [
          { label: 'Connect your site', description: 'Point ONE at your domain — takes 60 seconds.', detail: 'No code required' },
          { label: 'Add your agents', description: 'Pick from the library or describe one in plain English.', detail: 'Works with any model' },
          { label: 'Go live', description: 'Publish your page. Agents handle the rest.', detail: 'Scales automatically' },
        ],
      },
      render: (props: Record<string, unknown>) => <HowItWorks {...(props as any)} steps={(props.steps as any) ?? []} />,
    },

    LandingFeatures: {
      fields: {},
      defaultProps: {
        bgToken: 'none',
        title: 'Everything you need',
        subtitle: 'One platform, every capability.',
        columns: 3,
        features: [
          { headline: 'AI agents built in', body: 'Deploy agents for sales, support, and content — no integrations required.' },
          { headline: 'Pages that convert', body: 'Drag-and-drop blocks built for every funnel stage.' },
          { headline: 'Payments included', body: 'Accept crypto and card in minutes, globally.' },
        ],
      },
      render: (props: Record<string, unknown>) => <LandingFeatures {...(props as any)} features={(props.features as any) ?? []} />,
    },

    Testimonials: {
      fields: {},
      defaultProps: {
        bgToken: 'none',
        title: 'What our customers say',
        testimonials: [
          { quote: 'ONE cut our onboarding time in half. The agents handle everything we used to do manually.', name: 'Sarah O.', role: 'Head of Growth', company: 'Elevate Labs' },
          { quote: 'We launched our course site in a weekend. The drag-and-drop editor is genuinely impressive.', name: 'Marco D.', role: 'Founder', company: 'Skill Stack' },
        ],
      },
      render: (props: Record<string, unknown>) => <Testimonials {...(props as any)} testimonials={(props.testimonials as any) ?? []} />,
    },

    PricingSection: {
      fields: {},
      defaultProps: {
        title: 'Simple, transparent pricing',
        subtitle: 'Start free. Scale as you grow.',
        tiers: [
          { name: 'Free', monthlyPrice: '$0', annualPrice: '$0', description: 'Everything you need to get started.', cta: 'Get started', ctaHref: '#' },
          { name: 'Pro', monthlyPrice: '$49', annualPrice: '$39', description: 'For teams that want more power and scale.', cta: 'Start free trial', ctaHref: '#' },
        ],
      },
      render: (props: Record<string, unknown>) => <PricingSection {...(props as any)} tiers={(props.tiers as any) ?? []} />,
    },

    FAQSection: {
      fields: {},
      defaultProps: {
        bgToken: 'none',
        title: 'Frequently asked questions',
        faqs: [
          { q: 'Do I need to know how to code?', a: 'No. ONE is designed for non-technical founders and marketers. Everything is drag-and-drop or describe-in-plain-English.' },
          { q: 'Can I use my own domain?', a: 'Yes. Connect any domain in under a minute from your settings panel.' },
        ],
      },
      render: (props: Record<string, unknown>) => <FAQSection {...(props as any)} faqs={(props.faqs as any) ?? []} />,
    },

    SecondaryCTA: {
      fields: {},
      defaultProps: {
        bgToken: 'none',
        headline: 'Ready to start?',
        primaryCta: { label: 'Get started', href: '#' },
      },
      render: (props: Record<string, unknown>) => (
        <SecondaryCTA
          {...(props as any)}
          primaryCta={(props.primaryCta as any) ?? { label: 'Get started', href: '#' }}
          secondaryCta={(props.secondaryCta as any)?.label ? (props.secondaryCta as any) : undefined}
        />
      ),
    },

    FooterSection: {
      fields: {},
      defaultProps: {
        brand: 'ONE',
        links: [
          { label: 'About', href: '#' },
          { label: 'Features', href: '#' },
          { label: 'Pricing', href: '#' },
          { label: 'Contact', href: '#' },
        ],
        socials: [
          { platform: 'twitter', href: '#' },
          { platform: 'instagram', href: '#' },
        ],
        copyright: '© ONE, made for better web.',
      },
      render: (props: Record<string, unknown>) => (
        <FooterSection
          brand={props.brand as string}
          links={(props.links as any) ?? []}
          socials={(props.socials as any) ?? []}
          copyright={props.copyright as string}
        />
      ),
    },
  },
}
