import type { OnePluginFactory } from '@oneie/frontend'

export interface OneBookingConfig {
  /** Workspace slug (required) */
  ws: string
  /** Agent slug to handle bookings */
  agent?: string
  /** Default appointment duration in minutes */
  duration?: number
  /** Calendar integration */
  calendar?: 'google' | 'ical' | 'both'
  /** IANA timezone — defaults to browser timezone at runtime */
  timezone?: string
  /** Send email confirmation to the booker */
  confirmEmail?: boolean
  /** Override the default API endpoint */
  endpoint?: string
}

export const booking: OnePluginFactory<OneBookingConfig> = (config = {} as OneBookingConfig) => ({
  name: 'plugin-booking',
  tier: 'connected',
  serves: 'https://one.ie/b/booking.js',
  config: undefined,
  integration: undefined,
  entitlement: undefined,
})

export type { OneBookingConfig as BookingConfig }
