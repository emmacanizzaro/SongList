import { ExecutionContext, ForbiddenException } from '@nestjs/common'
import { PlanType } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { ActiveSubscriptionGuard } from './active-subscription.guard'

function contextFor(method: string, churchId = 'church-1') {
  return {
    switchToHttp: () => ({ getRequest: () => ({ method, user: { churchId } }) }),
  } as unknown as ExecutionContext
}

function guardWith(sub: unknown) {
  const prisma = { subscription: { findUnique: jest.fn().mockResolvedValue(sub) } }
  return { guard: new ActiveSubscriptionGuard(prisma as unknown as PrismaService), prisma }
}

const expiredTrial = { plan: PlanType.FREE, trialEndsAt: new Date('2020-01-01'), currentPeriodEnd: null }

describe('ActiveSubscriptionGuard', () => {
  it('always allows reads, even with an expired trial', async () => {
    const { guard, prisma } = guardWith(expiredTrial)
    await expect(guard.canActivate(contextFor('GET'))).resolves.toBe(true)
    expect(prisma.subscription.findUnique).not.toHaveBeenCalled()
  })

  it('blocks writes once the trial has ended', async () => {
    const { guard } = guardWith(expiredTrial)
    await expect(guard.canActivate(contextFor('POST'))).rejects.toThrow(ForbiddenException)
  })

  it('allows writes during an active trial', async () => {
    const { guard } = guardWith({ ...expiredTrial, trialEndsAt: new Date(Date.now() + 86_400_000) })
    await expect(guard.canActivate(contextFor('PATCH'))).resolves.toBe(true)
  })

  it('allows writes for UNLIMITED churches', async () => {
    const { guard } = guardWith({ ...expiredTrial, plan: PlanType.UNLIMITED })
    await expect(guard.canActivate(contextFor('DELETE'))).resolves.toBe(true)
  })
})
