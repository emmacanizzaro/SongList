import { Injectable, NotFoundException } from "@nestjs/common";
import { PlanType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { EntitlementsService } from "./entitlements.service";
import { getPlanLimits, PlanLimits } from "./plan-limits";
import { StripeService } from "./stripe.service";

@Injectable()
export class SubscriptionsService {
  constructor(
    private prisma: PrismaService,
    private entitlements: EntitlementsService,
    private stripe: StripeService,
  ) {}

  async getSubscription(churchId: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { churchId },
    });
    if (!sub) throw new NotFoundException("Suscripción no encontrada");

    return {
      ...sub,
      limits: getPlanLimits(sub.plan),
    };
  }

  async getLimits(churchId: string): Promise<PlanLimits> {
    return this.entitlements.getLimits(churchId);
  }

  async getEntitlements(churchId: string) {
    return this.entitlements.getSnapshot(churchId);
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
      throw new NotFoundException(
        "No existe sesión de Stripe para esta iglesia",
      );
    }
    const session = await this.stripe.createCustomerPortalSession(
      sub.stripeCustomerId,
      `${frontendUrl}/settings/billing`,
    );
    return { portalUrl: session.url };
  }

  // TEMPORAL: Upgrade a PRO directo
  async upgradeToPro(churchId: string) {
    const result = await this.prisma.subscription.upsert({
      where: { churchId },
      update: {
        plan: "PRO",
        status: "ACTIVE",
        cancelAtPeriodEnd: false,
      },
      create: {
        churchId,
        plan: "PRO",
        status: "ACTIVE",
        cancelAtPeriodEnd: false,
      },
    });
    return { message: "Upgrade a PRO realizado", result };
  }
}
