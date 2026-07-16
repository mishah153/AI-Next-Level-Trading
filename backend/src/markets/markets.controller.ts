import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MarketKind } from '@prisma/client';
import { MarketsService } from './markets.service';

@ApiTags('markets')
@Controller({ path: 'markets', version: '1' })
export class MarketsController {
  constructor(private readonly markets: MarketsService) {}

  @Get()
  @ApiOperation({ summary: 'List tradable instruments' })
  @ApiQuery({ name: 'market', enum: MarketKind, required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('market') market?: MarketKind,
    @Query('search') search?: string,
  ) {
    return this.markets.findAll(market, search);
  }

  @Get(':symbol')
  @ApiOperation({ summary: 'Get a single instrument by symbol' })
  findOne(@Param('symbol') symbol: string) {
    return this.markets.findOne(decodeURIComponent(symbol));
  }

  @Get(':symbol/candles')
  @ApiOperation({ summary: 'OHLC candles for the trade chart' })
  @ApiQuery({ name: 'count', required: false })
  candles(@Param('symbol') symbol: string, @Query('count') count?: string) {
    return this.markets.candles(
      decodeURIComponent(symbol),
      count ? Number(count) : undefined,
    );
  }

  @Get(':symbol/orderbook')
  @ApiOperation({ summary: 'Order book depth' })
  orderBook(@Param('symbol') symbol: string) {
    return this.markets.orderBook(decodeURIComponent(symbol));
  }

  @Get(':symbol/trades')
  @ApiOperation({ summary: 'Recent trades tape' })
  recentTrades(@Param('symbol') symbol: string) {
    return this.markets.recentTrades(decodeURIComponent(symbol));
  }
}
