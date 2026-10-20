import { ConflictException } from '@nestjs/common'
import { MemberRole } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { EntitlementsService } from '../subscriptions/entitlements.service'
import { ChurchesService } from './churches.service'
import { InviteEmailService } from './invite-email.service'

const CHURCH_ID = 'church-1'
const ADMIN_ID = 'admin-1'

function createMocks() {
  const prisma = {
    user: { findUnique: jest.fn(), create: jest.fn() },
    membership: { findUnique: jest.fn(), create: jest.fn() },
    churchInvite: {
      updateMany: jest.fn(),
      create: jest.fn(async ({ data }) => ({ ...data, church: { name: 'Iglesia', slug: 'iglesia' } })),
    },
  }
  const entitlements = { assertCanAddMember: jest.fn() }
  const inviteEmail = {
    sendInviteEmail: jest.fn().mockResolvedValue({ emailSent: true, inviteUrl: 'https://app/invite' }),
  }

  const service = new ChurchesService(
    prisma as unknown as PrismaService,
    entitlements as unknown as EntitlementsService,
    inviteEmail as unknown as InviteEmailService,
  )

  return { service, prisma, entitlements, inviteEmail }
}

describe('ChurchesService invites', () => {
  it('sends an invite link when adding an email with no account', async () => {
    const { service, prisma, inviteEmail } = createMocks()
    prisma.user.findUnique.mockResolvedValue(null)
    prisma.user.create.mockResolvedValue({ id: 'placeholder-1' })
    prisma.membership.findUnique.mockResolvedValue(null)
    prisma.membership.create.mockResolvedValue({ id: 'membership-1' })

    const result = await service.inviteMember(
      CHURCH_ID,
      ADMIN_ID,
      'Nuevo@Iglesia.org',
      MemberRole.EDITOR,
      MemberRole.ADMIN,
    )

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ name: 'Invitado nuevo@iglesia.org' }),
    })
    expect(prisma.churchInvite.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ email: 'nuevo@iglesia.org', invitedByUserId: ADMIN_ID }),
      }),
    )
    expect(inviteEmail.sendInviteEmail).toHaveBeenCalledTimes(1)
    expect(result).toEqual(expect.objectContaining({ emailSent: true }))
  })

  it('does not send an invite link when adding someone who already has an account', async () => {
    const { service, prisma, inviteEmail } = createMocks()
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', name: 'Ana Pérez' })
    prisma.membership.findUnique.mockResolvedValue(null)
    prisma.membership.create.mockResolvedValue({ id: 'membership-1' })

    await service.inviteMember(CHURCH_ID, ADMIN_ID, 'ana@iglesia.org', MemberRole.READER, MemberRole.ADMIN)

    expect(inviteEmail.sendInviteEmail).not.toHaveBeenCalled()
  })

  it('lets an admin re-send the link to a pending invitee without counting a new seat', async () => {
    const { service, prisma, entitlements, inviteEmail } = createMocks()
    prisma.user.findUnique.mockResolvedValue({ id: 'placeholder-1', name: 'Invitado x@iglesia.org' })
    prisma.membership.findUnique.mockResolvedValue({ id: 'membership-1' })

    await service.createInviteLink(CHURCH_ID, ADMIN_ID, 'x@iglesia.org', MemberRole.EDITOR, MemberRole.ADMIN)

    expect(entitlements.assertCanAddMember).not.toHaveBeenCalled()
    expect(inviteEmail.sendInviteEmail).toHaveBeenCalledTimes(1)
  })

  it('rejects an invite link for someone who is already a real member', async () => {
    const { service, prisma } = createMocks()
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', name: 'Ana Pérez' })
    prisma.membership.findUnique.mockResolvedValue({ id: 'membership-1' })

    await expect(
      service.createInviteLink(CHURCH_ID, ADMIN_ID, 'ana@iglesia.org', MemberRole.EDITOR, MemberRole.ADMIN),
    ).rejects.toThrow(ConflictException)
  })
})
