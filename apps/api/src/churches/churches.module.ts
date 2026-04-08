import { Module } from "@nestjs/common";
import {
  ChurchesController,
  PublicChurchInvitesController,
} from "./churches.controller";
import { ChurchesService } from "./churches.service";

@Module({
  controllers: [ChurchesController, PublicChurchInvitesController],
  providers: [ChurchesService],
  exports: [ChurchesService],
})
export class ChurchesModule {}
