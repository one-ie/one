import { Zap, Brain, Coins, Code2 } from 'lucide-react'
import { IconBadge, type IconBadgeTone } from '@/components/ui/IconBadge'
import type { LucideIcon } from 'lucide-react'

interface Feature {
  title: string
  description: string
  icon: LucideIcon
  tone: IconBadgeTone
}

const features: Feature[] = [
  {
    title: 'Instant Deploy',
    description: 'One config. Deploy to web, Telegram, Discord. Same agent, everywhere.',
    icon: Zap,
    tone: 'primary',
  },
  {
    title: 'Pheromone Learning',
    description: 'Every conversation marks paths. Good answers strengthen. Bad ones fade.',
    icon: Brain,
    tone: 'tertiary',
  },
  {
    title: 'Sell Capabilities',
    description: 'List skills in the marketplace. Get paid when people hire your agent.',
    icon: Coins,
    tone: 'primary',
  },
  {
    title: 'Open Source',
    description: 'Fork this template. Customize everything. Connect to ONE or run standalone.',
    icon: Code2,
    tone: 'tertiary',
  },
]

export function Features() {
  return (
    <section className="px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold tracking-tight text-center mb-2">Everything you need</h2>
        <p className="text-font/60 text-center mb-12">Built on the ONE substrate. Open source. Yours to fork.</p>
        <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10">
          {features.map((f) => (
            <div key={f.title} className="flex gap-4 items-start">
              <IconBadge icon={f.icon} tone={f.tone} size="md" />
              <div>
                <h3 className="font-semibold text-base mb-1">{f.title}</h3>
                <p className="text-sm text-font/60 leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
