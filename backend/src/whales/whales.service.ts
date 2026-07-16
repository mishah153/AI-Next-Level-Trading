import { Injectable } from '@nestjs/common';
import { MarketKind, Prisma, Sentiment } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WhalesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(market?: MarketKind, impact?: Sentiment) {
    const where: Prisma.WhaleTransactionWhereInput = {};
    if (market) where.market = market;
    if (impact) where.impact = impact;
    return this.prisma.whaleTransaction.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  }

  async stats() {
    const all = await this.prisma.whaleTransaction.findMany();
    const sum = (t: string) =>
      all.filter((x) => x.type === t).reduce((s, x) => s + x.amountUsd, 0);
    const inflow = sum('exchange_inflow');
    const outflow = sum('exchange_outflow');
    const total = all.reduce((s, x) => s + x.amountUsd, 0);
    return {
      total,
      inflow,
      outflow,
      netFlow: outflow - inflow,
      count: all.length,
    };
  }
}
