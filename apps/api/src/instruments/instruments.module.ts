import { Module } from "@nestjs/common";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";
import { InstrumentsController } from "./instruments.controller";
import { InstrumentsService } from "./instruments.service";

@Module({
  imports: [SubscriptionsModule],
  controllers: [InstrumentsController],
  providers: [InstrumentsService],
})
export class InstrumentsModule {}
