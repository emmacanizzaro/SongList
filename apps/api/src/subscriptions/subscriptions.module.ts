import { Module } from "@nestjs/common";
import { EntitlementsService } from "./entitlements.service";
import { StripeService } from "./stripe.service";
import {
  StripeWebhookController,
  SubscriptionsController,
} from "./subscriptions.controller";
import { SubscriptionsService } from "./subscriptions.service";

@Module({
  controllers: [SubscriptionsController, StripeWebhookController],
  providers: [SubscriptionsService, StripeService, EntitlementsService],
  exports: [SubscriptionsService, EntitlementsService],
})
export class SubscriptionsModule {}
