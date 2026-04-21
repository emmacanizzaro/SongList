import { Module } from "@nestjs/common";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";
import {
  MeetingsController,
  PublicMeetingsController,
} from "./meetings.controller";
import { MeetingsService } from "./meetings.service";

@Module({
  imports: [SubscriptionsModule],
  controllers: [MeetingsController, PublicMeetingsController],
  providers: [MeetingsService],
})
export class MeetingsModule {}
