import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from './stripe.service';
import { getPlanLimits, PlanLimits } from './plan-limits';
import { PlanType } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(
    private prisma: PrismaService,
    private stripe: StripeService,
  ) {}

  async getSubscription(churchId: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { churchId },
    });
    if (!sub) throw new NotFoundException('Suscripción no encontrada');

    return {
      ...sub,
      limits: getPlanLimits(sub.plan),
    };
  }

  async getLimits(churchId: string): Promise<PlanLimits> {
    const sub = await this.prisma.subscription.findUnique({
      where: { churchId },
      select: { plan: true },
    });
    return getPlanLimits(sub?.plan ?? PlanType.FREE);
  }

  async createCheckout(
    churchId: string,
    plan: PlanType,
    userEmail: string,
    frontendUrl: string,
  ) {
    const session = await this.stripe.createCheckoutSession(
      churchId,
      plan,
      userEmail,
      `${frontendUrl}/settings/billing?success=true`,
      `${frontendUrl}/settings/billing?canceled=true`,
    );
    return { checkoutUrl: session.url };
  }

  async createPortalSession(churchId: string, frontendUrl: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { churchId },
      select: { stripeCustomerId: true },
    });
    if (!sub?.stripeCustomerId) {
      throw new NotFoundException('No existe sesión de Stripe para esta iglesia');
    }
    const session = await this.stripe.createCustomerPortalSession(
      sub.stripeCustomerId,
      `${frontendUrl}/settings/billing`,
    );
    return { portalUrl: session.url };
  }
}
