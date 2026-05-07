import { useEffect, useState } from 'react'
import { emitClick } from '@/lib/ui-signal'
import { DomainSettings } from './DomainSettings'

type Category =
  | 'Profile'
  | 'Keys & devices'
  | 'Notifications'
  | 'Workspace'
  | 'Domain'
  | 'Billing'
  | 'Agents'
  | 'Skills'
  | 'Tools'
  | 'API keys'
  | 'Privacy'
  | 'Danger zone'

const CATEGORIES: Category[] = [
  'Profile',
  'Keys & devices',
  'Notifications',
  'Workspace',
  'Domain',
  'Billing',
  'Agents',
  'Skills',
  'Tools',
  'API keys',
  'Privacy',
  'Danger zone',
]

function ProfileSection() {
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [website, setWebsite] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    emitClick('ui:settings:save-profile')
    const slug = typeof localStorage !== 'undefined'
      ? (localStorage.getItem('token')?.split(':')[0] ?? '')
      : ''
    if (slug && displayName) {
      const fd = new FormData()
      fd.append('slug', slug)
      fd.append('display_name', displayName)
      await fetch('/api/settings', { method: 'POST', body: fd }).catch(() => {})
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div>
        <h2 className="text-lg font-semibold text-font">Profile</h2>
        <p className="text-font/60 text-sm mt-1">Manage your public profile information.</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="display-name" className="text-sm font-medium text-font">
            Display name
          </label>
          <input
            id="display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="px-3.5 py-2.5 rounded-lg bg-background text-font border focus:outline-none focus:ring-2 focus:ring-primary/25 text-sm"
            style={{ borderColor: 'var(--color-border)' }}
            placeholder="Ada Lovelace"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="bio" className="text-sm font-medium text-font">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="px-3.5 py-2.5 rounded-lg bg-background text-font border focus:outline-none focus:ring-2 focus:ring-primary/25 text-sm resize-none"
            style={{ borderColor: 'var(--color-border)' }}
            placeholder="Tell us a little about yourself"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="website" className="text-sm font-medium text-font">
            Website
          </label>
          <input
            id="website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="px-3.5 py-2.5 rounded-lg bg-background text-font border focus:outline-none focus:ring-2 focus:ring-primary/25 text-sm"
            style={{ borderColor: 'var(--color-border)' }}
            placeholder="https://example.com"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium hover:brightness-110 transition-all"
        >
          {saved ? 'Saved' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}

function KeysDevicesSection() {
  const [addDeviceMessage, setAddDeviceMessage] = useState('')

  const handleAddDevice = () => {
    emitClick('ui:settings:add-device')
    setAddDeviceMessage('Device registration coming soon.')
    setTimeout(() => setAddDeviceMessage(''), 3000)
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div>
        <h2 className="text-lg font-semibold text-font">Keys & devices</h2>
        <p className="text-font/60 text-sm mt-1">Manage your passkeys, recovery codes, and trusted devices.</p>
      </div>

      <div
        className="p-4 rounded-xl bg-foreground border flex flex-col gap-4"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-font">Recovery codes</p>
            <p className="text-xs text-font/60 mt-0.5">12-word paper backup for account recovery</p>
          </div>
          <a
            href="/recovery-codes"
            className="px-3.5 py-2 rounded-lg border text-font text-sm hover:bg-background transition-all"
            style={{ borderColor: 'var(--color-border)' }}
          >
            View codes
          </a>
        </div>

        <div
          className="border-t"
          style={{ borderColor: 'var(--color-border)' }}
        />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-font">Add device</p>
            <p className="text-xs text-font/60 mt-0.5">Register a new passkey on this device</p>
          </div>
          <button
            onClick={handleAddDevice}
            className="px-3.5 py-2 rounded-lg bg-primary text-on-primary text-sm hover:brightness-110 transition-all"
          >
            Add device
          </button>
        </div>

        {addDeviceMessage && (
          <p className="text-xs text-font/60">{addDeviceMessage}</p>
        )}
      </div>
    </div>
  )
}

function DomainSection() {
  const slug =
    typeof localStorage !== 'undefined'
      ? (localStorage.getItem('token')?.split(':')[0] ?? '')
      : ''

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div>
        <h2 className="text-lg font-semibold text-font">Domain</h2>
        <p className="text-font/60 text-sm mt-1">Connect your own domain to your workspace.</p>
      </div>
      <DomainSettings slug={slug} />
    </div>
  )
}

function ComingSoonSection({ category }: { category: Category }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-font">{category}</h2>
      </div>
      <div className="text-font/60 text-sm p-6">Coming soon</div>
    </div>
  )
}

function CategoryContent({ category }: { category: Category }) {
  if (category === 'Profile') return <ProfileSection />
  if (category === 'Keys & devices') return <KeysDevicesSection />
  if (category === 'Domain') return <DomainSection />
  return <ComingSoonSection category={category} />
}

export function SettingsView() {
  const [activeCategory, setActiveCategory] = useState<Category>('Profile')

  useEffect(() => {
    emitClick('ui:settings:view')
  }, [])

  return (
    <div className="flex min-h-screen">
      {/* Left rail */}
      <nav
        className="flex-none w-[200px] bg-background border-r flex flex-col gap-1 py-6 px-3"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              emitClick(`ui:settings:nav-${cat.toLowerCase().replace(/[^a-z]/g, '-')}`)
              setActiveCategory(cat)
            }}
            className={[
              'px-4 py-2 rounded-lg text-font text-sm text-left transition-all',
              activeCategory === cat
                ? 'bg-foreground font-medium'
                : 'hover:bg-foreground/50',
            ].join(' ')}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* Right content */}
      <main className="flex-1 p-8">
        <CategoryContent category={activeCategory} />
      </main>
    </div>
  )
}
