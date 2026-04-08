import { Module } from '@nestjs/common';
import { SubscriptionsController, StripeWebhookController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { StripeService } from './stripe.service';

@Module({
  controllers: [SubscriptionsController, StripeWebhookController],
  providers: [SubscriptionsService, StripeService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
