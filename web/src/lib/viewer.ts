/**
 * Derives the viewer role from session info. Pure function — no DB, no IO.
 *
 * Three roles:
 *  - end_user   — anonymous, or signed-in but viewing someone else's workspace
 *  - developer  — owns the workspace they are viewing (can edit, deploy)
 *  - creator    — has staff role on the platform (can publish, moderate)
 *
 * Rules (precedence top to bottom):
 *  1. staffRole=true               → 'creator'
 *  2. ownerSlug === workspaceSlug  → 'developer'
 *  3. otherwise (incl. !hasSession)→ 'end_user'
 */

export interface SessionInfo {
  hasSession: boolean
  ownerSlug?: string
  workspaceSlug?: string
  staffRole?: boolean
}

export type Viewer = 'creator' | 'developer' | 'end_user'

export function deriveViewer(session: SessionInfo): Viewer {
  if (!session.hasSession) return 'end_user'
  if (session.staffRole) return 'creator'
  if (session.ownerSlug && session.workspaceSlug && session.ownerSlug === session.workspaceSlug) {
    return 'developer'
  }
  return 'end_user'
}
