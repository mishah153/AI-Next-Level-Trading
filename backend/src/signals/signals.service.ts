import { Injectable, NotFoundException } from '@nestjs/common';
import { MarketKind, Prisma, SignalAction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SignalsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(action?: SignalAction, market?: MarketKind) {
    const where: Prisma.SignalWhereInput = {};
    if (action) where.action = action;
    if (market) where.market = market;
    return this.prisma.signal.findMany({
      where,
      orderBy: { confidence: 'desc' },
    });
  }

  async findOne(id: string) {
    const signal = await this.prisma.signal.findUnique({ where: { id } });
    if (!signal) throw new NotFoundException(`Signal ${id} not found`);
    return signal;
  }
}
