import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MarketKind, Sentiment } from '@prisma/client';
import { WhalesService } from './whales.service';

@ApiTags('whales')
@Controller({ path: 'whales', version: '1' })
export class WhalesController {
  constructor(private readonly whales: WhalesService) {}

  @Get()
  @ApiOperation({ summary: 'Whale-Eye feed of large transactions' })
  @ApiQuery({ name: 'market', enum: MarketKind, required: false })
  @ApiQuery({ name: 'impact', enum: Sentiment, required: false })
  findAll(
    @Query('market') market?: MarketKind,
    @Query('impact') impact?: Sentiment,
  ) {
    return this.whales.findAll(market, impact);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Aggregate whale-flow statistics' })
  stats() {
    return this.whales.stats();
  }
}
