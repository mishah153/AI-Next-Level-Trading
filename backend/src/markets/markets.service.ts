import { Injectable, NotFoundException } from '@nestjs/common';
import { Instrument, MarketKind, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { createRng, seedFrom } from '../common/util/rng';

/** Fixed reference clock so generated series are reproducible. */
const MARKET_NOW = Date.parse('2026-07-15T14:30:00Z');

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
}

@Injectable()
export class MarketsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(market?: MarketKind, search?: string) {
    const where: Prisma.InstrumentWhereInput = {};
    if (market) where.market = market;
    if (search) {
      where.OR = [
        { symbol: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.instrument.findMany({
      where,
      orderBy: { volume24hUsd: 'desc' },
    });
  }

  async findOne(symbol: string) {
    const instrument = await this.prisma.instrument.findUnique({
      where: { symbol },
    });
    if (!instrument) {
      throw new NotFoundException(`Instrument ${symbol} not found`);
    }
    return instrument;
  }

  async candles(symbol: string, count = 120): Promise<Candle[]> {
    const inst = await this.findOne(symbol);
    return this.generateCandles(inst, count);
  }

  async orderBook(symbol: string) {
    const inst = await this.findOne(symbol);
    const rng = createRng(seedFrom('ob-' + symbol));
    const digits = inst.price < 1 ? 5 : 2;
    const step = inst.price * 0.0004;
    const bids: OrderBookLevel[] = [];
    const asks: OrderBookLevel[] = [];
    let bTotal = 0;
    let aTotal = 0;
    for (let i = 0; i < 12; i++) {
      const bSize = rng.range(0.5, 24);
      const aSize = rng.range(0.5, 24);
      bTotal += bSize;
      aTotal += aSize;
      bids.push({
        price: Number((inst.price - step * (i + 1)).toFixed(digits)),
        size: Number(bSize.toFixed(3)),
        total: Number(bTotal.toFixed(3)),
      });
      asks.push({
        price: Number((inst.price + step * (i + 1)).toFixed(digits)),
        size: Number(aSize.toFixed(3)),
        total: Number(aTotal.toFixed(3)),
      });
    }
    const spread = asks[0].price - bids[0].price;
    return {
      bids,
      asks,
      spread: Number(spread.toFixed(digits)),
      spreadPct: Number(((spread / inst.price) * 100).toFixed(3)),
    };
  }

  async recentTrades(symbol: string, count = 30) {
    const inst = await this.findOne(symbol);
    const rng = createRng(seedFrom('trades-' + symbol));
    const digits = inst.price < 1 ? 5 : 2;
    return Array.from({ length: count }, (_, i) => ({
      id: `${symbol}-t${i}`,
      time: MARKET_NOW - i * rng.int(1500, 9000),
      price: Number((inst.price * rng.range(0.999, 1.001)).toFixed(digits)),
      size: Number(rng.range(0.01, 12).toFixed(4)),
      side: rng.chance(0.5) ? 'buy' : 'sell',
    }));
  }

  private generateCandles(inst: Instrument, count: number): Candle[] {
    const rng = createRng(seedFrom('candles-' + inst.symbol));
    const candles: Candle[] = [];
    const intervalSec = 3600;
    let close = inst.price * rng.range(0.9, 1.05);
    const startTime = Math.floor(MARKET_NOW / 1000) - count * intervalSec;
    const digits = inst.price < 1 ? 5 : 2;
    for (let i = 0; i < count; i++) {
      const drift = (inst.price - close) * 0.02;
      const open = close;
      const vol = inst.price * 0.012;
      close = open + drift + rng.gaussian() * vol;
      const high = Math.max(open, close) + rng.range(0, vol);
      const low = Math.min(open, close) - rng.range(0, vol);
      candles.push({
        time: startTime + i * intervalSec,
        open: Number(open.toFixed(digits)),
        high: Number(high.toFixed(digits)),
        low: Number(low.toFixed(digits)),
        close: Number(close.toFixed(digits)),
        volume: Math.round(rng.range(500, 9000)),
      });
    }
    candles[candles.length - 1].close = inst.price;
    return candles;
  }
}
