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
var StripeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const stripe_1 = require("stripe");
const prisma_service_1 = require("../prisma/prisma.service");
let StripeService = StripeService_1 = class StripeService {
    constructor(config, prisma) {
        this.config = config;
        this.prisma = prisma;
        this.stripe = null;
        this.logger = new common_1.Logger(StripeService_1.name);
        const secretKey = config.get("STRIPE_SECRET_KEY");
        if (!secretKey) {
            this.logger.warn("Stripe deshabilitado: falta STRIPE_SECRET_KEY");
            return;
        }
        try {
            this.stripe = new stripe_1.default(secretKey, {
                apiVersion: "2023-10-16",
            });
        }
        catch (error) {
            this.logger.error("Stripe no pudo inicializarse. Se deshabilita billing.", error);
            this.stripe = null;
        }
    }
    getStripeClient() {
        if (!this.stripe) {
            throw new common_1.ServiceUnavailableException("Stripe no está disponible en este entorno");
        }
        return this.stripe;
    }
    async createCheckoutSession(churchId, plan, customerEmail, successUrl, cancelUrl) {
        const stripe = this.getStripeClient();
        const priceId = this.getPriceId(plan);
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "subscription",
            customer_email: customerEmail,
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: { churchId, plan },
            subscription_data: {
                metadata: { churchId, plan },
                trial_period_days: plan === client_1.PlanType.PRO ? 14 : undefined,
            },
        });
        return session;
    }
    async createCustomerPortalSession(stripeCustomerId, returnUrl) {
        const stripe = this.getStripeClient();
        return stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: returnUrl,
        });
    }
    async handleWebhook(payload, signature) {
        const stripe = this.getStripeClient();
        const webhookSecret = this.config.getOrThrow("STRIPE_WEBHOOK_SECRET");
        let event;
        try {
            event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        }
        catch (err) {
            this.logger.error("Stripe webhook signature inválida", err);
            throw new Error("Webhook signature inválida");
        }
        switch (event.type) {
            case "checkout.session.completed":
                await this.handleCheckoutCompleted(event.data.object);
                break;
            case "customer.subscription.updated":
                await this.handleSubscriptionUpdated(event.data.object);
                break;
            case "customer.subscription.deleted":
                await this.handleSubscriptionDeleted(event.data.object);
                break;
            case "invoice.payment_failed":
                await this.handlePaymentFailed(event.data.object);
                break;
            default:
                this.logger.debug(`Evento no manejado: ${event.type}`);
        }
    }
    async handleCheckoutCompleted(session) {
        const stripe = this.getStripeClient();
        const churchId = session.metadata?.churchId;
        const plan = session.metadata?.plan;
        if (!churchId || !plan)
            return;
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        await this.prisma.subscription.update({
            where: { churchId },
            data: {
                plan,
                status: "ACTIVE",
                stripeCustomerId: session.customer,
                stripeSubscriptionId: subscription.id,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
        });
        this.logger.log(`✅ Iglesia ${churchId} activó plan ${plan}`);
    }
    async handleSubscriptionUpdated(subscription) {
        const churchId = subscription.metadata?.churchId;
        if (!churchId)
            return;
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
    async handleSubscriptionDeleted(subscription) {
        await this.prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subscription.id },
            data: { plan: client_1.PlanType.FREE, status: "CANCELED" },
        });
        this.logger.log(`Suscripción cancelada: ${subscription.id}`);
    }
    async handlePaymentFailed(invoice) {
        const subscriptionId = invoice.subscription;
        await this.prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subscriptionId },
            data: { status: "PAST_DUE" },
        });
    }
    getPriceId(plan) {
        const prices = {
            [client_1.PlanType.PRO]: this.config.get("STRIPE_PRICE_PRO_MONTHLY"),
            [client_1.PlanType.ENTERPRISE]: this.config.get("STRIPE_PRICE_ENTERPRISE_MONTHLY"),
        };
        const priceId = prices[plan];
        if (!priceId)
            throw new Error(`Price ID no configurado para plan ${plan}`);
        return priceId;
    }
    mapStripeStatus(status) {
        const map = {
            active: "ACTIVE",
            trialing: "TRIALING",
            past_due: "PAST_DUE",
            canceled: "CANCELED",
            incomplete: "INCOMPLETE",
        };
        return map[status] ?? "ACTIVE";
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = StripeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], StripeService);
//# sourceMappingURL=stripe.service.js.map