import { Injectable, NotFoundException } from '@nestjs/common'
import { MemberRole, PlanType, Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { getAccessState, PLAN_PRICES_USD, trialEndDate } from '../subscriptions/plan-limits'
import { UpdateSubscriptionDto } from './update-subscription.dto'

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async listChurches() {
    const churches = await this.prisma.church.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        createdAt: true,
        subscription: {
          select: { plan: true, status: true, trialEndsAt: true, currentPeriodEnd: true },
        },
        memberships: {
          where: { role: MemberRole.ADMIN },
          orderBy: { joinedAt: 'asc' },
          take: 1,
          select: { user: { select: { name: true, email: true } } },
        },
        _count: { select: { memberships: true, songs: true, meetings: true } },
      },
    })

    return churches.map(({ memberships, subscription, ...church }) => ({
      ...church,
      owner: memberships[0]?.user ?? null,
      subscription: subscription && {
        ...subscription,
        access: getAccessState(subscription),
        priceUsd: PLAN_PRICES_USD[subscription.plan],
      },
    }))
  }

  async updateSubscription(churchId: string, dto: UpdateSubscriptionDto) {
    const existing = await this.prisma.subscription.findUnique({ where: { churchId } })
    if (!existing) throw new NotFoundException('Iglesia o suscripción no encontrada')

    const data: Prisma.SubscriptionUpdateInput = { plan: dto.plan, status: 'ACTIVE' }

    if (dto.plan === PlanType.FREE) {
      // Moving back to FREE without a date starts a fresh 30-day trial.
      data.trialEndsAt =
        dto.trialEndsAt !== undefined
          ? toDate(dto.trialEndsAt)
          : existing.plan === PlanType.FREE
            ? existing.trialEndsAt
            : trialEndDate()
      data.currentPeriodEnd = null
    } else {
      data.trialEndsAt = null
      data.currentPeriodEnd =
        dto.plan === PlanType.UNLIMITED
          ? null
          : dto.currentPeriodEnd !== undefined
            ? toDate(dto.currentPeriodEnd)
            : existing.currentPeriodEnd
    }

    const updated = await this.prisma.subscription.update({
      where: { churchId },
      data,
      select: { plan: true, status: true, trialEndsAt: true, currentPeriodEnd: true },
    })

    return { ...updated, access: getAccessState(updated) }
  }
}

function toDate(value: string | null | undefined): Date | null {
  return value ? new Date(value) : null
}
