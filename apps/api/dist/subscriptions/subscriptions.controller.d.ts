import { RawBodyRequest } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PlanType } from "@prisma/client";
import { Request } from "express";
import { StripeService } from "./stripe.service";
import { SubscriptionsService } from "./subscriptions.service";
export declare class SubscriptionsController {
    private readonly subscriptionsService;
    private readonly stripeService;
    private readonly config;
    constructor(subscriptionsService: SubscriptionsService, stripeService: StripeService, config: ConfigService);
    getSubscription(churchId: string): Promise<{
        limits: import("./plan-limits").PlanLimits;
        id: string;
        churchId: string;
        plan: import(".prisma/client").$Enums.PlanType;
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        stripeCustomerId: string | null;
        stripeSubscriptionId: string | null;
        currentPeriodStart: Date | null;
        currentPeriodEnd: Date | null;
        cancelAtPeriodEnd: boolean;
        mpSubscriptionId: string | null;
        mpCustomerEmail: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getEntitlements(churchId: string): Promise<import("./entitlements.service").EntitlementsSnapshot>;
    createCheckout(churchId: string, email: string, plan: PlanType): Promise<{
        checkoutUrl: string | null;
    }>;
    createPortal(churchId: string): Promise<{
        portalUrl: string;
    }>;
}
export declare class StripeWebhookController {
    private readonly stripeService;
    constructor(stripeService: StripeService);
    handleWebhook(req: RawBodyRequest<Request>, signature: string): Promise<{
        received: boolean;
    }>;
}
