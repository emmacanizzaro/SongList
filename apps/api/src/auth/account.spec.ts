import { BadRequestException, ExecutionContext, ForbiddenException, ServiceUnavailableException } from '@nestjs/common'
import { AuthTokenType } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { MailerService } from '../common/services/mailer.service'
import { PrismaService } from '../prisma/prisma.service'
import { AccountService } from './account.service'
import { AuthEmailService } from './auth-email.service'
import { AuthTokensService, hashToken } from './auth-tokens.service'
import { VerifiedEmailGuard } from './guards/verified-email.guard'

const TOKEN = 'b'.repeat(64)

function accountMocks({ emailEnabled = true } = {}) {
  const prisma = {
    user: { findUnique: jest.fn(), update: jest.fn() },
    refreshToken: { deleteMany: jest.fn() },
    $transaction: jest.fn(async (ops: unknown[]) => ops),
  }
  const authEmail = {
    isEnabled: jest.fn().mockReturnValue(emailEnabled),
    sendPasswordReset: jest.fn().mockResolvedValue(true),
    sendEmailVerification: jest.fn().mockResolvedValue(true),
  }
  const authTokens = { issue: jest.fn().mockResolvedValue(TOKEN), consume: jest.fn() }
  const service = new AccountService(
    prisma as unknown as PrismaService,
    authEmail as unknown as AuthEmailService,
    authTokens as unknown as AuthTokensService,
  )
  return { service, prisma, authEmail, authTokens }
}

describe('AccountService.requestPasswordReset', () => {
  it('answers the same whether or not the email exists', async () => {
    const known = accountMocks()
    known.prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'ana@x.org', name: 'Ana' })
    const unknown = accountMocks()
    unknown.prisma.user.findUnique.mockResolvedValue(null)

    const a = await known.service.requestPasswordReset('ana@x.org')
    const b = await unknown.service.requestPasswordReset('nadie@x.org')

    expect(a).toEqual(b)
    expect(known.authEmail.sendPasswordReset).toHaveBeenCalledWith('ana@x.org', 'Ana', TOKEN)
    expect(unknown.authEmail.sendPasswordReset).not.toHaveBeenCalled()
  })

  it('does not send a reset link to a pending invitee', async () => {
    const { service, prisma, authEmail } = accountMocks()
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'x@x.org', name: 'Invitado x@x.org' })

    await service.requestPasswordReset('x@x.org')

    expect(authEmail.sendPasswordReset).not.toHaveBeenCalled()
  })

  it('is unavailable until email delivery is configured', async () => {
    const { service } = accountMocks({ emailEnabled: false })
    await expect(service.requestPasswordReset('ana@x.org')).rejects.toThrow(ServiceUnavailableException)
  })
})

describe('AccountService.resetPassword', () => {
  it('rejects an invalid, used or expired link', async () => {
    const { service, authTokens, prisma } = accountMocks()
    authTokens.consume.mockResolvedValue(null)

    await expect(service.resetPassword(TOKEN, 'new-password')).rejects.toThrow(BadRequestException)
    expect(prisma.user.update).not.toHaveBeenCalled()
  })

  it('stores a hash of the new password and signs out every session', async () => {
    const { service, authTokens, prisma } = accountMocks()
    authTokens.consume.mockResolvedValue('u1')

    await service.resetPassword(TOKEN, 'new-password')

    expect(authTokens.consume).toHaveBeenCalledWith(TOKEN, AuthTokenType.PASSWORD_RESET)
    const { data } = prisma.user.update.mock.calls[0][0]
    expect(data.passwordHash).not.toBe('new-password')
    expect(await bcrypt.compare('new-password', data.passwordHash)).toBe(true)
    expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({ where: { userId: 'u1' } })
  })
})

describe('AccountService.verifyEmail', () => {
  it('marks the email as verified with a valid link', async () => {
    const { service, authTokens, prisma } = accountMocks()
    authTokens.consume.mockResolvedValue('u1')

    await service.verifyEmail(TOKEN)

    expect(authTokens.consume).toHaveBeenCalledWith(TOKEN, AuthTokenType.EMAIL_VERIFICATION)
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { emailVerifiedAt: expect.any(Date) },
    })
  })
})

describe('AuthTokensService', () => {
  function tokensWith(record: unknown, updatedCount = 1) {
    const prisma = {
      authToken: {
        findUnique: jest.fn().mockResolvedValue(record),
        updateMany: jest.fn().mockResolvedValue({ count: updatedCount }),
        create: jest.fn(),
      },
      $transaction: jest.fn(async (ops: unknown[]) => ops),
    }
    return { tokens: new AuthTokensService(prisma as unknown as PrismaService), prisma }
  }
  const valid = {
    id: 't1',
    userId: 'u1',
    type: AuthTokenType.PASSWORD_RESET,
    usedAt: null,
    expiresAt: new Date(Date.now() + 60_000),
  }

  it('stores only the hash of a new random token', async () => {
    const { tokens, prisma } = tokensWith(null)
    const token = await tokens.issue('u1', AuthTokenType.PASSWORD_RESET)

    expect(token).toMatch(/^[0-9a-f]{64}$/)
    const { data } = prisma.authToken.create.mock.calls[0][0]
    expect(data.tokenHash).toBe(hashToken(token))
    expect(JSON.stringify(data)).not.toContain(token)
  })

  it('accepts a valid token once', async () => {
    const { tokens } = tokensWith(valid)
    await expect(tokens.consume(TOKEN, AuthTokenType.PASSWORD_RESET)).resolves.toBe('u1')
  })

  it('rejects expired, used or wrong-type tokens', async () => {
    const expired = tokensWith({ ...valid, expiresAt: new Date(Date.now() - 1) }).tokens
    const used = tokensWith({ ...valid, usedAt: new Date() }).tokens
    const wrongType = tokensWith(valid).tokens

    await expect(expired.consume(TOKEN, AuthTokenType.PASSWORD_RESET)).resolves.toBeNull()
    await expect(used.consume(TOKEN, AuthTokenType.PASSWORD_RESET)).resolves.toBeNull()
    await expect(wrongType.consume(TOKEN, AuthTokenType.EMAIL_VERIFICATION)).resolves.toBeNull()
  })

  it('rejects the losing request when the same link is used twice at once', async () => {
    const { tokens } = tokensWith(valid, 0)
    await expect(tokens.consume(TOKEN, AuthTokenType.PASSWORD_RESET)).resolves.toBeNull()
  })
})

describe('VerifiedEmailGuard', () => {
  const context = {
    switchToHttp: () => ({ getRequest: () => ({ user: { id: 'u1' } }) }),
  } as unknown as ExecutionContext

  function guardWith(configured: boolean, emailVerifiedAt: Date | null) {
    const prisma = { user: { findUnique: jest.fn().mockResolvedValue({ emailVerifiedAt }) } }
    const mailer = { isConfigured: () => configured }
    return new VerifiedEmailGuard(prisma as unknown as PrismaService, mailer as unknown as MailerService)
  }

  it('does not block anyone while email delivery is off', async () => {
    await expect(guardWith(false, null).canActivate(context)).resolves.toBe(true)
  })

  it('blocks unverified users once email delivery is on', async () => {
    await expect(guardWith(true, null).canActivate(context)).rejects.toThrow(ForbiddenException)
  })

  it('lets verified users through', async () => {
    await expect(guardWith(true, new Date()).canActivate(context)).resolves.toBe(true)
  })
})
