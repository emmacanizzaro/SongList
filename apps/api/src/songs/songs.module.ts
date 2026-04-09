import { Module } from "@nestjs/common";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";
import { TranspositionModule } from "../transposition/transposition.module";
import { SongsController } from "./songs.controller";
import { SongsService } from "./songs.service";

@Module({
  imports: [TranspositionModule, SubscriptionsModule],
  controllers: [SongsController],
  providers: [SongsService],
  exports: [SongsService],
})
export class SongsModule {}
