import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from './stripe.service';
import { PlanLimits } from './plan-limits';
import { PlanType } from '@prisma/client';
export declare class SubscriptionsService {
    private prisma;
    private stripe;
    constructor(prisma: PrismaService, stripe: StripeService);
    getSubscription(churchId: string): Promise<{
        limits: PlanLimits;
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
    getLimits(churchId: string): Promise<PlanLimits>;
    createCheckout(churchId: string, plan: PlanType, userEmail: string, frontendUrl: string): Promise<{
        checkoutUrl: string | null;
    }>;
    createPortalSession(churchId: string, frontendUrl: string): Promise<{
        portalUrl: string;
    }>;
}
