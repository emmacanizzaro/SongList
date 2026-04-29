  // ENDPOINT TEMPORAL: Upgrade a PRO sin auth
  @Post("upgrade-to-pro-temporal")
  async upgradeToProTemporal(@Body("churchId") churchId: string) {
    // Cambia el plan a PRO para la iglesia indicada
    return this.subscriptionsService.upgradeToPro(churchId);
  }
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { MemberRole, PlanType } from "@prisma/client";
import { Request } from "express";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CurrentTenant } from "../common/decorators/tenant.decorator";
import { StripeService } from "./stripe.service";
import { SubscriptionsService } from "./subscriptions.service";

@ApiTags("subscriptions")
@ApiBearerAuth("JWT")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("subscriptions")
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly stripeService: StripeService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  @ApiOperation({ summary: "Obtener plan y estado de suscripción" })
  getSubscription(@CurrentTenant() churchId: string) {
    return this.subscriptionsService.getSubscription(churchId);
  }

  @Get("entitlements")
  @ApiOperation({ summary: "Obtener entitlements efectivos del tenant" })
  getEntitlements(@CurrentTenant() churchId: string) {
    return this.subscriptionsService.getEntitlements(churchId);
  }

  @Post("checkout")
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: "Crear sesión de checkout para upgradar plan" })
  createCheckout(
    @CurrentTenant() churchId: string,
    @CurrentUser("email") email: string,
    @Body("plan") plan: PlanType,
  ) {
    const frontendUrl = this.config.get(
      "FRONTEND_URL",
      "http://localhost:3000",
    );
    return this.subscriptionsService.createCheckout(
      churchId,
      plan,
      email,
      frontendUrl,
    );
  }

  @Post("portal")
  @Roles(MemberRole.ADMIN)
  @ApiOperation({
    summary: "Acceder al portal de Stripe para gestionar suscripción",
  })
  createPortal(@CurrentTenant() churchId: string) {
    const frontendUrl = this.config.get(
      "FRONTEND_URL",
      "http://localhost:3000",
    );
    return this.subscriptionsService.createPortalSession(churchId, frontendUrl);
  }
}

// ── Webhook de Stripe (sin JWT, verificado por firma Stripe) ──
import { Controller as WebhookCtrl } from "@nestjs/common";

@ApiTags("subscriptions")
@WebhookCtrl("webhooks/stripe")
export class StripeWebhookController {
  constructor(private readonly stripeService: StripeService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Webhook Stripe (no requiere auth, verificado por firma)",
  })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers("stripe-signature") signature: string,
  ) {
    await this.stripeService.handleWebhook(req.rawBody!, signature);
    return { received: true };
  }
}
