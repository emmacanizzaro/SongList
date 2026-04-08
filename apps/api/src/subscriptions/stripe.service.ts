import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PlanType } from "@prisma/client";
import Stripe from "stripe";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.stripe = new Stripe(config.getOrThrow("STRIPE_SECRET_KEY"), {
      apiVersion: "2023-10-16",
    });
  }

  // ── Crear sesión de checkout ──────────────────────────────

  async createCheckoutSession(
    churchId: string,
    plan: PlanType,
    customerEmail: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<Stripe.Checkout.Session> {
    const priceId = this.getPriceId(plan);

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: customerEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { churchId, plan },
      subscription_data: {
        metadata: { churchId, plan },
        trial_period_days: plan === PlanType.PRO ? 14 : undefined,
      },
    });

    return session;
  }

  // ── Portal de cliente Stripe (gestión de suscripción) ────

  async createCustomerPortalSession(
    stripeCustomerId: string,
    returnUrl: string,
  ): Promise<Stripe.BillingPortal.Session> {
    return this.stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });
  }

  // ── Webhook handler ──────────────────────────────────────

  async handleWebhook(payload: Buffer, signature: string): Promise<void> {
    const webhookSecret = this.config.getOrThrow("STRIPE_WEBHOOK_SECRET");
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err) {
      this.logger.error("Stripe webhook signature inválida", err);
      throw new Error("Webhook signature inválida");
    }

    switch (event.type) {
      case "checkout.session.completed":
        await this.handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case "customer.subscription.updated":
        await this.handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        );
        break;
      case "customer.subscription.deleted":
        await this.handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;
      case "invoice.payment_failed":
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        this.logger.debug(`Evento no manejado: ${event.type}`);
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const churchId = session.metadata?.churchId;
    const plan = session.metadata?.plan as PlanType;
    if (!churchId || !plan) return;

    const subscription = await this.stripe.subscriptions.retrieve(
      session.subscription as string,
    );

    await this.prisma.subscription.update({
      where: { churchId },
      data: {
        plan,
        status: "ACTIVE",
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: subscription.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });

    this.logger.log(`✅ Iglesia ${churchId} activó plan ${plan}`);
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const churchId = subscription.metadata?.churchId;
    if (!churchId) return;

    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: this.mapStripeStatus(subscription.status),
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: { plan: PlanType.FREE, status: "CANCELED" },
    });
    this.logger.log(`Suscripción cancelada: ${subscription.id}`);
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    const subscriptionId = invoice.subscription as string;
    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: { status: "PAST_DUE" },
    });
  }

  private getPriceId(plan: PlanType): string {
    const prices: Record<string, string | undefined> = {
      [PlanType.PRO]: this.config.get("STRIPE_PRICE_PRO_MONTHLY"),
      [PlanType.ENTERPRISE]: this.config.get("STRIPE_PRICE_ENTERPRISE_MONTHLY"),
    };
    const priceId = prices[plan];
    if (!priceId) throw new Error(`Price ID no configurado para plan ${plan}`);
    return priceId;
  }

  private mapStripeStatus(
    status: Stripe.Subscription.Status,
  ): "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING" | "INCOMPLETE" {
    const map: Record<
      string,
      "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING" | "INCOMPLETE"
    > = {
      active: "ACTIVE",
      trialing: "TRIALING",
      past_due: "PAST_DUE",
      canceled: "CANCELED",
      incomplete: "INCOMPLETE",
    };
    return map[status] ?? "ACTIVE";
  }
}
