import { ConfigService } from "@nestjs/config";
import { PlanType } from "@prisma/client";
import Stripe from "stripe";
import { PrismaService } from "../prisma/prisma.service";
export declare class StripeService {
    private config;
    private prisma;
    private stripe;
    private readonly logger;
    constructor(config: ConfigService, prisma: PrismaService);
    private getStripeClient;
    createCheckoutSession(churchId: string, plan: PlanType, customerEmail: string, successUrl: string, cancelUrl: string): Promise<Stripe.Checkout.Session>;
    createCustomerPortalSession(stripeCustomerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session>;
    handleWebhook(payload: Buffer, signature: string): Promise<void>;
    private handleCheckoutCompleted;
    private handleSubscriptionUpdated;
    private handleSubscriptionDeleted;
    private handlePaymentFailed;
    private getPriceId;
    private mapStripeStatus;
}
