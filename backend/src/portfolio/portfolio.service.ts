import { Injectable } from '@nestjs/common';
import { MarketKind } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { createRng, seedFrom } from '../common/util/rng';

const DAY_MS = 86_400_000;

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService) {}

  positions(userId: string) {
    return this.prisma.position.findMany({
      where: { userId },
      orderBy: { openedAt: 'desc' },
    });
  }

  async summary(userId: string) {
    const positions = await this.prisma.position.findMany({
      where: { userId },
    });

    const invested = positions.reduce(
      (sum, p) => sum + p.marginUsd * p.leverage,
      0,
    );
    const unrealizedPnl = positions.reduce(
      (sum, p) => sum + p.unrealizedPnl,
      0,
    );
    const available = Math.max(invested * 0.25, 5000);
    const totalValueUsd = invested + available + unrealizedPnl;

    // Deterministic 90-day equity curve ending at the current value.
    const equityCurve = this.buildEquityCurve(userId, totalValueUsd);
    const first = equityCurve[0].value;
    const prev = equityCurve[equityCurve.length - 2]?.value ?? totalValueUsd;

    const byMarket = (market: MarketKind) =>
      positions
        .filter((p) => p.market === market)
        .reduce((sum, p) => sum + p.marginUsd * p.leverage, 0);

    const allocation = [
      { label: 'Crypto', market: 'crypto', valueUsd: byMarket('crypto') },
      { label: 'Stocks', market: 'stocks', valueUsd: byMarket('stocks') },
      { label: 'Forex', market: 'forex', valueUsd: byMarket('forex') },
      { label: 'Cash (USDC)', market: 'cash', valueUsd: available },
    ].map((slice) => ({
      ...slice,
      pct:
        totalValueUsd > 0
          ? Number(((slice.valueUsd / totalValueUsd) * 100).toFixed(1))
          : 0,
    }));

    return {
      totalValueUsd: Number(totalValueUsd.toFixed(2)),
      availableUsd: Number(available.toFixed(2)),
      investedUsd: Number(invested.toFixed(2)),
      pnl24hUsd: Number((totalValueUsd - prev).toFixed(2)),
      pnl24hPct: Number((((totalValueUsd - prev) / prev) * 100).toFixed(2)),
      pnlAllTimeUsd: Number((totalValueUsd - first).toFixed(2)),
      pnlAllTimePct: Number(
        (((totalValueUsd - first) / first) * 100).toFixed(2),
      ),
      allocation,
      equityCurve,
    };
  }

  private buildEquityCurve(userId: string, endValue: number) {
    const rng = createRng(seedFrom('equity-' + userId));
    const points: { date: string; value: number }[] = [];
    // Walk backwards from a start value, then normalize the tail to endValue.
    let v = endValue * 0.82;
    const now = Date.now();
    for (let i = 90; i >= 0; i--) {
      v += v * (rng.gaussian() * 0.018 + 0.0018);
      points.push({
        date: new Date(now - i * DAY_MS).toISOString(),
        value: Number(v.toFixed(2)),
      });
    }
    points[points.length - 1].value = Number(endValue.toFixed(2));
    return points;
  }
}
