"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const stripe_service_1 = require("./stripe.service");
const plan_limits_1 = require("./plan-limits");
const client_1 = require("@prisma/client");
let SubscriptionsService = class SubscriptionsService {
    constructor(prisma, stripe) {
        this.prisma = prisma;
        this.stripe = stripe;
    }
    async getSubscription(churchId) {
        const sub = await this.prisma.subscription.findUnique({
            where: { churchId },
        });
        if (!sub)
            throw new common_1.NotFoundException('Suscripción no encontrada');
        return {
            ...sub,
            limits: (0, plan_limits_1.getPlanLimits)(sub.plan),
        };
    }
    async getLimits(churchId) {
        const sub = await this.prisma.subscription.findUnique({
            where: { churchId },
            select: { plan: true },
        });
        return (0, plan_limits_1.getPlanLimits)(sub?.plan ?? client_1.PlanType.FREE);
    }
    async createCheckout(churchId, plan, userEmail, frontendUrl) {
        const session = await this.stripe.createCheckoutSession(churchId, plan, userEmail, `${frontendUrl}/settings/billing?success=true`, `${frontendUrl}/settings/billing?canceled=true`);
        return { checkoutUrl: session.url };
    }
    async createPortalSession(churchId, frontendUrl) {
        const sub = await this.prisma.subscription.findUnique({
            where: { churchId },
            select: { stripeCustomerId: true },
        });
        if (!sub?.stripeCustomerId) {
            throw new common_1.NotFoundException('No existe sesión de Stripe para esta iglesia');
        }
        const session = await this.stripe.createCustomerPortalSession(sub.stripeCustomerId, `${frontendUrl}/settings/billing`);
        return { portalUrl: session.url };
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        stripe_service_1.StripeService])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map