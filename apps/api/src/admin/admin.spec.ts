import { ExecutionContext, ForbiddenException } from '@nestjs/common'
import { PlanType } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { AdminService } from './admin.service'
import { PlatformAdminGuard } from './platform-admin.guard'

function contextFor(user: unknown) {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext
}

describe('PlatformAdminGuard', () => {
  const guard = new PlatformAdminGuard()

  it('lets the platform admin in', () => {
    expect(guard.canActivate(contextFor({ isPlatformAdmin: true }))).toBe(true)
  })

  it('rejects church admins and anyone else', () => {
    expect(() => guard.canActivate(contextFor({ currentRole: 'ADMIN' }))).toThrow(ForbiddenException)
    expect(() => guard.canActivate(contextFor(undefined))).toThrow(ForbiddenException)
  })
})

describe('AdminService.updateSubscription', () => {
  function serviceWith(existing: Record<string, unknown>) {
    const prisma = {
      subscription: {
        findUnique: jest.fn().mockResolvedValue(existing),
        update: jest.fn(async ({ data }) => ({
          plan: data.plan,
          status: data.status,
          trialEndsAt: data.trialEndsAt ?? null,
          currentPeriodEnd: data.currentPeriodEnd ?? null,
        })),
      },
    }
    return { service: new AdminService(prisma as unknown as PrismaService), prisma }
  }

  it('sets a paid plan with its paid-until date and clears the trial', async () => {
    const { service, prisma } = serviceWith({ plan: PlanType.FREE, trialEndsAt: new Date(), currentPeriodEnd: null })

    await service.updateSubscription('church-1', {
      plan: PlanType.PRO,
      currentPeriodEnd: '2026-11-20T23:59:59.000Z',
    })

    expect(prisma.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          plan: PlanType.PRO,
          trialEndsAt: null,
          currentPeriodEnd: new Date('2026-11-20T23:59:59.000Z'),
        }),
      }),
    )
  })

  it('gives UNLIMITED no dates at all', async () => {
    const { service, prisma } = serviceWith({ plan: PlanType.PRO, trialEndsAt: null, currentPeriodEnd: new Date() })

    const result = await service.updateSubscription('church-1', { plan: PlanType.UNLIMITED })

    expect(prisma.subscription.update.mock.calls[0][0].data).toMatchObject({
      trialEndsAt: null,
      currentPeriodEnd: null,
    })
    expect(result.access).toBe('active')
  })

  it('starts a fresh 30-day trial when moving a paid church back to FREE without a date', async () => {
    const { service, prisma } = serviceWith({ plan: PlanType.PRO, trialEndsAt: null, currentPeriodEnd: null })

    await service.updateSubscription('church-1', { plan: PlanType.FREE })

    const trialEndsAt: Date = prisma.subscription.update.mock.calls[0][0].data.trialEndsAt
    const days = Math.round((trialEndsAt.getTime() - Date.now()) / 86_400_000)
    expect(days).toBe(30)
  })
})
