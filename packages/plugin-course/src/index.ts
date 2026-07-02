import type { OnePluginFactory } from '@oneie/frontend'

export interface OneCourseConfig {
  /** Workspace slug (required) */
  ws: string
  /** Specific course ID — omit to show the full course catalog */
  courseId?: string
  /** Payment provider for enrollment */
  provider?: 'stripe' | 'x402' | 'both'
  /** Issue a completion certificate at 100% progress */
  completionCertificate?: boolean
  /** Track per-lesson progress in the substrate */
  progressTracking?: boolean
  /** Override the default API endpoint */
  endpoint?: string
}

export const course: OnePluginFactory<OneCourseConfig> = (_config = {} as OneCourseConfig) => ({
  name: 'plugin-course',
  tier: 'paid',
  serves: 'https://one.ie/x/course.js',
  entitlement: 'course',
  config: undefined,
  integration: undefined,
})

export type { OneCourseConfig as CourseConfig }
