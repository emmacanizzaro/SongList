import {
  Controller, Get, Post, Body, Headers,
  RawBodyRequest, Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { MemberRole, PlanType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { SubscriptionsService } from './subscriptions.service';
import { StripeService } from './stripe.service';

@ApiTags('subscriptions')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly stripeService: StripeService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener plan y estado de suscripción' })
  getSubscription(@CurrentTenant() churchId: string) {
    return this.subscriptionsService.getSubscription(churchId);
  }

  @Post('checkout')
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Crear sesión de checkout para upgradar plan' })
  createCheckout(
    @CurrentTenant() churchId: string,
    @CurrentUser('email') email: string,
    @Body('plan') plan: PlanType,
  ) {
    const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:3000');
    return this.subscriptionsService.createCheckout(churchId, plan, email, frontendUrl);
  }

  @Post('portal')
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Acceder al portal de Stripe para gestionar suscripción' })
  createPortal(@CurrentTenant() churchId: string) {
    const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:3000');
    return this.subscriptionsService.createPortalSession(churchId, frontendUrl);
  }
}

// ── Webhook de Stripe (sin JWT, verificado por firma Stripe) ──
import { Controller as WebhookCtrl } from '@nestjs/common';

@ApiTags('subscriptions')
@WebhookCtrl('webhooks/stripe')
export class StripeWebhookController {
  constructor(private readonly stripeService: StripeService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook Stripe (no requiere auth, verificado por firma)' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    await this.stripeService.handleWebhook(req.rawBody!, signature);
    return { received: true };
  }
}
