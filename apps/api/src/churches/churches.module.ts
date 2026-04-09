import { Module } from "@nestjs/common";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";
import {
  ChurchesController,
  PublicChurchInvitesController,
} from "./churches.controller";
import { ChurchesService } from "./churches.service";
import { InviteEmailService } from "./invite-email.service";

@Module({
  imports: [SubscriptionsModule],
  controllers: [ChurchesController, PublicChurchInvitesController],
  providers: [ChurchesService, InviteEmailService],
  exports: [ChurchesService],
})
export class ChurchesModule {}
