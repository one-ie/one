import { ArrowRight, ExternalLink } from 'lucide-react'
import { Icon } from '@/components/ui/Icon'

export function Hero() {
  return (
    <section className="px-6 py-24 text-center">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
          AI Agents That
          <br />
          <span className="text-tertiary">Actually Learn</span>
        </h1>
        <p className="text-lg text-font/60 mb-10 max-w-xl mx-auto leading-relaxed">
          Deploy your agent to web, Telegram, and Discord. Every conversation teaches the substrate.
          Good answers strengthen paths. Bad ones fade.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/chat"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-lg font-medium hover:brightness-110 transition"
          >
            Try the demo
            <Icon icon={ArrowRight} size="md" />
          </a>
          <a
            href="https://dev.one.ie"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-on-secondary rounded-lg font-medium hover:brightness-110 transition"
          >
            Visit ONE
            <Icon icon={ExternalLink} size="md" />
          </a>
        </div>
      </div>
    </section>
  )
}
