import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStrategyDto, UpdateStrategyDto } from './dto/automation.dto';

const EMPTY_STATS = {
  trades30d: 0,
  winRate: 0,
  pnl30dUsd: 0,
  pnl30dPct: 0,
};

@Injectable()
export class AutomationService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.automationStrategy.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(userId: string, dto: CreateStrategyDto) {
    return this.prisma.automationStrategy.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        scope: dto.scope,
        riskLevel: dto.riskLevel,
        spendingLimitUsd: dto.spendingLimitUsd,
        follows: dto.follows,
        connectionId: dto.connectionId,
        enabled: dto.enabled ?? false,
        autoExecute: dto.autoExecute ?? false,
        stats: EMPTY_STATS,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateStrategyDto) {
    await this.assertOwned(userId, id);
    return this.prisma.automationStrategy.update({
      where: { id },
      data: dto,
    });
  }

  async remove(userId: string, id: string) {
    await this.assertOwned(userId, id);
    await this.prisma.automationStrategy.delete({ where: { id } });
    return { success: true };
  }

  private async assertOwned(userId: string, id: string) {
    const found = await this.prisma.automationStrategy.findFirst({
      where: { id, userId },
    });
    if (!found) throw new NotFoundException('Strategy not found');
    return found;
  }
}
