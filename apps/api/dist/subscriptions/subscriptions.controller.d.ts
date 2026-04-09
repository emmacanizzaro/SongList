import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { PlanType } from '@prisma/client';
import { SubscriptionsService } from './subscriptions.service';
import { StripeService } from './stripe.service';
export declare class SubscriptionsController {
    private readonly subscriptionsService;
    private readonly stripeService;
    private readonly config;
    constructor(subscriptionsService: SubscriptionsService, stripeService: StripeService, config: ConfigService);
    getSubscription(churchId: string): Promise<{
        limits: import("./plan-limits").PlanLimits;
        id: string;
        churchId: string;
        createdAt: Date;
        updatedAt: Date;
        plan: import(".prisma/client").$Enums.PlanType;
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        stripeCustomerId: string | null;
        stripeSubscriptionId: string | null;
        currentPeriodStart: Date | null;
        currentPeriodEnd: Date | null;
        cancelAtPeriodEnd: boolean;
        mpSubscriptionId: string | null;
        mpCustomerEmail: string | null;
    }>;
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
