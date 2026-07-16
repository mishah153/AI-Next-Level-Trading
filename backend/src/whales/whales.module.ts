import { Module } from '@nestjs/common';
import { WhalesService } from './whales.service';
import { WhalesController } from './whales.controller';

@Module({
  controllers: [WhalesController],
  providers: [WhalesService],
})
export class WhalesModule {}
