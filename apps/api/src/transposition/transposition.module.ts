import { Module } from '@nestjs/common';
import { TranspositionService } from './transposition.service';

@Module({
  providers: [TranspositionService],
  exports: [TranspositionService],
})
export class TranspositionModule {}
