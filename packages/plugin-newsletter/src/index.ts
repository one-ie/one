import type { OnePluginFactory } from '@oneie/frontend'

export interface OneNewsletterConfig {
  /** Workspace slug — scopes contacts to this workspace's audience/CRM. */
  workspace: string
  /** Audience list name. Defaults to 'newsletter'. */
  list?: string
}

/** newsletter() — free plugin, no build-time integration. Registering it in
 *  one.config.ts declares the wiring; the actual work happens through
 *  subscribeToAudience() (server) and bindNewsletterForms() (client) below. */
export const newsletter: OnePluginFactory<OneNewsletterConfig> = (_config = {} as OneNewsletterConfig) => ({
  name: 'plugin-newsletter',
  tier: 'free',
  config: undefined,
  integration: undefined,
  entitlement: undefined,
})

/** Minimal shape of @oneie/sdk's SubstrateClient — duck-typed so this package
 *  doesn't need the SDK as a dependency. */
export interface AskClient {
  ask(receiver: string, data: unknown, timeoutMs?: number): Promise<{ kind: string; result?: unknown }>
}

export interface SubscribeToAudienceOptions {
  workspace: string
  address: string
  list?: string
  ref?: string
}

/** Server-side call: writes a consent:email:pending tag and starts double
 *  opt-in via the backend's audience:subscribe receiver (public, idempotent).
 *  Throws on any non-result outcome (timeout/dissolved/failure). */
export async function subscribeToAudience(
  client: AskClient,
  opts: SubscribeToAudienceOptions
): Promise<{ ok: true }> {
  const outcome = await client.ask('audience:subscribe', {
    workspace: opts.workspace,
    address: opts.address,
    list: opts.list,
    ref: opts.ref,
  })
  if (outcome.kind !== 'result') throw new Error(`audience:subscribe → ${outcome.kind}`)
  return { ok: true }
}

export interface BindNewsletterFormsOptions {
  /** API route this form POSTs to. Defaults to '/api/newsletter/subscribe'. */
  endpoint?: string
}

/** Client-side binder — wires up any form matching `selector` to POST an
 *  { email } body to `endpoint` and reflect success/error in-place. Expects
 *  the form's own markup to carry these attributes:
 *    - the form itself: `selector` (default '[data-newsletter-form]')
 *    - the email field: [data-newsletter-input]
 *    - the submit button: [data-newsletter-submit]
 *    - an optional status element: [data-newsletter-error]
 *  Safe to call on pages that render zero matching forms — it's a no-op. */
export function bindNewsletterForms(
  selector = '[data-newsletter-form]',
  opts: BindNewsletterFormsOptions = {}
): void {
  const endpoint = opts.endpoint ?? '/api/newsletter/subscribe'

  document.querySelectorAll<HTMLFormElement>(selector).forEach((form) => {
    if (form.dataset.bound) return
    form.dataset.bound = '1'

    const input = form.querySelector<HTMLInputElement>('[data-newsletter-input]')
    const submit = form.querySelector<HTMLButtonElement>('[data-newsletter-submit]')
    const errorBox = form.parentElement?.querySelector<HTMLElement>('[data-newsletter-error]')
    if (!input || !submit) return
    const idleLabel = submit.textContent ?? 'Subscribe'

    form.addEventListener('submit', (e) => {
      e.preventDefault()
      if (submit.dataset.done) return
      if (!input.checkValidity()) {
        input.reportValidity()
        return
      }
      if (errorBox) {
        errorBox.hidden = true
        errorBox.textContent = ''
      }
      submit.textContent = 'Subscribing…'
      submit.disabled = true

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: input.value }),
      })
        .then(async (res) => ({ ok: res.ok, body: await res.json().catch(() => ({})) as { error?: string } }))
        .then((result) => {
          if (!result.ok) throw new Error(result.body.error || 'subscribe failed')
          submit.dataset.done = '1'
          submit.textContent = 'Subscribed ✓'
          input.value = ''
          setTimeout(() => {
            submit.textContent = idleLabel
            submit.disabled = false
            delete submit.dataset.done
          }, 2600)
        })
        .catch(() => {
          submit.textContent = idleLabel
          submit.disabled = false
          if (errorBox) {
            errorBox.textContent = 'Something went wrong — please try again.'
            errorBox.hidden = false
          }
        })
    })
  })
}
