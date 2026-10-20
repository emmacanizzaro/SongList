import { ConflictException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { GUARDS_METADATA } from '@nestjs/common/constants'
import { ThrottlerGuard } from '@nestjs/throttler'
import { PrismaService } from '../prisma/prisma.service'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { WelcomeEmailService } from './welcome-email.service'

const PENDING_EMAIL = 'invitado@iglesia.org'

function createMocks() {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    churchInvite: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: { create: jest.fn() },
    $transaction: jest.fn(),
  }
  const jwt = { signAsync: jest.fn().mockResolvedValue('access-token') }
  const welcomeEmail = { sendWelcomeEmail: jest.fn().mockResolvedValue({ emailSent: true }) }
  const config = {
    get: jest.fn((_key: string, fallback?: unknown) => fallback),
    getOrThrow: jest.fn(() => 'test-secret'),
  }

  const service = new AuthService(
    prisma as unknown as PrismaService,
    jwt as unknown as JwtService,
    welcomeEmail as unknown as WelcomeEmailService,
    config as unknown as ConfigService,
  )

  return { service, prisma, jwt }
}

describe('AuthService.register', () => {
  it('rejects claiming a pending invite without the invite link', async () => {
    const { service, prisma, jwt } = createMocks()
    prisma.user.findUnique.mockResolvedValue({ name: `Invitado ${PENDING_EMAIL}` })

    await expect(
      service.register({
        email: PENDING_EMAIL,
        password: 'attacker-password',
        name: 'Attacker',
        churchName: 'Cualquier iglesia',
      }),
    ).rejects.toThrow(/invitación pendiente/)

    expect(prisma.user.update).not.toHaveBeenCalled()
    expect(jwt.signAsync).not.toHaveBeenCalled()
  })

  it('rejects an email that already belongs to a real account', async () => {
    const { service, prisma } = createMocks()
    prisma.user.findUnique.mockResolvedValue({ name: 'Ana Pérez' })

    await expect(
      service.register({
        email: 'ana@iglesia.org',
        password: 'password-123',
        name: 'Otra Ana',
        churchName: 'Iglesia',
      }),
    ).rejects.toThrow(new ConflictException('El email ya está registrado'))
  })

  it('activates a pending invite when the valid invite token is used', async () => {
    const { service, prisma, jwt } = createMocks()
    prisma.churchInvite.findUnique.mockResolvedValue({
      email: PENDING_EMAIL,
      churchId: 'church-1',
      acceptedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    })
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      name: `Invitado ${PENDING_EMAIL}`,
      memberships: [{ churchId: 'church-1', role: 'EDITOR' }],
    })
    prisma.user.update.mockResolvedValue({ id: 'user-1', email: PENDING_EMAIL, name: 'Invitee' })

    const result = await service.register({
      email: PENDING_EMAIL,
      password: 'invitee-password',
      name: 'Invitee',
      inviteToken: 'valid-token',
    })

    expect(prisma.user.update).toHaveBeenCalledTimes(1)
    expect(prisma.churchInvite.update).toHaveBeenCalledWith({
      where: { token: 'valid-token' },
      data: { acceptedAt: expect.any(Date) },
    })
    expect(jwt.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 'user-1', churchId: 'church-1', role: 'EDITOR' }),
      expect.anything(),
    )
    expect(result.accessToken).toBe('access-token')
  })
})

describe('AuthController rate limiting', () => {
  it('runs ThrottlerGuard so the @Throttle limits are enforced', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, AuthController) ?? []
    expect(guards).toContain(ThrottlerGuard)
  })
})
