import { Module } from '@nestjs/common';
import { MeetingsController, PublicMeetingsController } from './meetings.controller';
import { MeetingsService } from './meetings.service';

@Module({
  controllers: [MeetingsController, PublicMeetingsController],
  providers: [MeetingsService],
})
export class MeetingsModule {}
