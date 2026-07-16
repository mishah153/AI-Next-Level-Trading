import { Module } from '@nestjs/common';
import { MarketsService } from './markets.service';
import { MarketsController } from './markets.controller';
import { MarketGateway } from '../market/market.gateway';

@Module({
  controllers: [MarketsController],
  providers: [MarketsService, MarketGateway],
})
export class MarketsModule {}
