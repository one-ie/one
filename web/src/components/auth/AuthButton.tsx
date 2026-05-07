import { useEffect, useState } from 'react'
import { startAuthentication, startRegistration } from '@simplewebauthn/browser'
import { LogIn, LogOut, User } from 'lucide-react'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { emitClick } from '@/lib/ui-signal'

interface Props {
  open?: boolean
  slug?: string  // SSR-provided from session cookie via ctx.locals.slug
}

type Status = 'idle' | 'signing-in' | 'creating'

export function AuthButton({ open = true, slug: initialSlug }: Props) {
  const [slug, setSlug] = useState<string | null>(initialSlug ?? null)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  // Prerendered pages (e.g. homepage) skip middleware, so SSR can't inject the slug.
  // Resolve session on hydration via /api/auth GET, which checks the cookie.
  useEffect(() => {
    if (initialSlug) return
    const controller = new AbortController()
    fetch('/api/auth', { signal: controller.signal })
      .then(r => r.json() as Promise<{ slug?: string }>)
      .then(data => { if (data.slug) setSlug(data.slug) })
      .catch(() => {})
    return () => controller.abort()
  }, [initialSlug])

  const register = async () => {
    setStatus('creating')
    setError(null)
    try {
      const optRes = await fetch('/api/provision')
      if (!optRes.ok) throw new Error('Provision failed')
      const opts = await optRes.json() as { challenge: string; token: string; userId: string; rpId: string; rpName: string }

      const registration = await startRegistration({
        optionsJSON: {
          rp: { id: opts.rpId, name: opts.rpName },
          user: { id: opts.userId, name: 'one-user', displayName: 'ONE User' },
          challenge: opts.challenge,
          pubKeyCredParams: [{ alg: -7, type: 'public-key' as const }, { alg: -257, type: 'public-key' as const }],
          timeout: 60000,
          attestation: 'none' as const,
          authenticatorSelection: { authenticatorAttachment: 'platform' as const, residentKey: 'required' as const, userVerification: 'required' as const },
        },
      })

      const res = await fetch('/api/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration, userId: opts.userId, challenge: opts.challenge, token: opts.token, tosTimestamp: Date.now() }),
      })
      const data = await res.json() as { slug?: string; recoveryWords?: string[]; redirectTo?: string; error?: string }

      if (data.slug) {
        emitClick('ui:auth:registered')
        if (data.recoveryWords?.length) {
          sessionStorage.setItem('rc:words', JSON.stringify(data.recoveryWords))
        }
        window.location.href = `/recovery-codes?slug=${encodeURIComponent(data.slug)}&next=${encodeURIComponent(data.redirectTo ?? `/u/${data.slug}/chat`)}`
      } else {
        setError(data.error ?? 'registration failed')
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (!msg.includes('NotAllowedError') && !msg.includes('not allowed')) {
        setError(msg)
      }
    } finally {
      setStatus('idle')
    }
  }

  const signIn = async () => {
    emitClick('ui:auth:sign-in')
    setStatus('signing-in')
    setError(null)
    try {
      const optRes = await fetch('/api/auth')
      if (!optRes.ok) throw new Error(`Challenge fetch failed: ${optRes.status}`)
      const opts = await optRes.json() as { challenge: string; token: string; rpId: string; slug?: string }

      // Already signed in via existing session
      if (opts.slug) {
        setSlug(opts.slug)
        setStatus('idle')
        return
      }

      const assertion = await startAuthentication({
        optionsJSON: {
          challenge: opts.challenge,
          rpId: opts.rpId,
          userVerification: 'required',
          allowCredentials: [],
          timeout: 60000,
        },
      })

      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assertion, challenge: opts.challenge, token: opts.token }),
      })
      const data = await res.json() as { ok?: boolean; slug?: string; error?: string }

      if (data.ok && data.slug) {
        setSlug(data.slug)
        window.location.href = `/u/${data.slug}/chat`
      } else if (data.error === 'no-account') {
        // Passkey authenticated but no account exists — auto-register
        setStatus('idle')
        await register()
      } else {
        setError(data.error ?? 'sign-in-failed')
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('NotAllowedError') || msg.includes('not allowed')) {
        // No passkeys on device → go straight to registration
        setStatus('idle')
        await register()
      } else {
        setError(msg)
      }
    } finally {
      setStatus('idle')
    }
  }

  const signOut = async () => {
    emitClick('ui:auth:sign-out')
    await fetch('/api/auth', { method: 'DELETE' }).catch(() => {})
    setSlug(null)
    window.location.href = '/'
  }

  if (slug) {
    return (
      <div className="flex w-full flex-col gap-0.5">
        <a
          href={`/u/${slug}/chat`}
          onClick={() => emitClick('ui:auth:workspace')}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-font hover:bg-foreground transition-colors',
            !open && 'justify-center px-0',
          )}
          title={slug}
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary text-xs font-bold">
            {slug[0].toUpperCase()}
          </span>
          {open && <span className="truncate text-font/60">{slug}</span>}
        </a>
        <button
          type="button"
          onClick={signOut}
          aria-label="Sign out"
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm',
            'text-font/60 hover:bg-foreground/60 hover:text-font transition-colors',
            !open && 'justify-center px-0',
          )}
        >
          <Icon icon={LogOut} size={open ? 'md' : 'lg'} />
          {open && <span>Sign out</span>}
        </button>
      </div>
    )
  }

  const isWorking = status !== 'idle'
  const label = status === 'creating' ? 'Creating account…' : status === 'signing-in' ? 'Signing in…' : 'Sign in'

  return (
    <>
      <button
        type="button"
        onClick={signIn}
        disabled={isWorking}
        aria-label="Sign in"
        title="Sign in"
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm',
          'text-font/60 hover:bg-foreground/60 hover:text-font disabled:opacity-50',
          !open && 'justify-center px-0',
        )}
      >
        <Icon icon={isWorking ? User : LogIn} size={open ? 'md' : 'lg'} />
        {open && <span>{label}</span>}
      </button>
      {error && open && <p className="px-3 text-xs text-destructive">{error}</p>}
    </>
  )
}
