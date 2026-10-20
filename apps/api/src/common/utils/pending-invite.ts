/**
 * Placeholder users are created when an admin invites an email that has no
 * account yet. They are identified by this name prefix until the invitee
 * registers through their invite link.
 *
 * TODO(phase 2): replace the name prefix with an explicit column.
 */
export const PENDING_INVITE_NAME_PREFIX = 'Invitado '

export function isPendingInviteName(name: string): boolean {
  return name.startsWith(PENDING_INVITE_NAME_PREFIX)
}
