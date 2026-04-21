import { PlanType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { EntitlementsService } from "./entitlements.service";
import { PlanLimits } from "./plan-limits";
import { StripeService } from "./stripe.service";
export declare class SubscriptionsService {
    private prisma;
    private entitlements;
    private stripe;
    constructor(prisma: PrismaService, entitlements: EntitlementsService, stripe: StripeService);
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
    getEntitlements(churchId: string): Promise<import("./entitlements.service").EntitlementsSnapshot>;
    createCheckout(churchId: string, plan: PlanType, userEmail: string, frontendUrl: string): Promise<{
        checkoutUrl: string | null;
    }>;
    createPortalSession(churchId: string, frontendUrl: string): Promise<{
        portalUrl: string;
    }>;
}
