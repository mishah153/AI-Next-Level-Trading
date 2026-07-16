import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type Sentiment = 'bullish' | 'bearish' | 'neutral';

export interface ActivityItem {
  id: string;
  kind: 'signal' | 'whale' | 'order' | 'automation' | 'system';
  title: string;
  detail: string;
  timestamp: string;
  sentiment?: Sentiment;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async activity(userId: string): Promise<ActivityItem[]> {
    const [orders, signals, whales] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
      this.prisma.signal.findMany({
        orderBy: { confidence: 'desc' },
        take: 2,
      }),
      this.prisma.whaleTransaction.findMany({
        orderBy: { timestamp: 'desc' },
        take: 2,
      }),
    ]);

    const items: ActivityItem[] = [
      ...signals.map((s): ActivityItem => ({
        id: `act-sig-${s.id}`,
        kind: 'signal',
        title: `New ${s.action} signal · ${s.symbol}`,
        detail: `${s.confidence}% confidence`,
        timestamp: s.createdAt.toISOString(),
        sentiment:
          s.action === 'BUY'
            ? 'bullish'
            : s.action === 'NEUTRAL'
              ? 'neutral'
              : 'bearish',
      })),
      ...whales.map((w): ActivityItem => ({
        id: `act-whale-${w.id}`,
        kind: 'whale',
        title: `🐋 ${w.asset} — ${w.type.replace(/_/g, ' ')}`,
        detail: w.aiInterpretation,
        timestamp: w.timestamp.toISOString(),
        sentiment: w.impact,
      })),
      ...orders.map((o): ActivityItem => ({
        id: `act-ord-${o.id}`,
        kind: 'order',
        title: `Order ${o.status} · ${o.symbol}`,
        detail: `${o.size} ${o.side} @ ${o.price ?? 'market'}`,
        timestamp: o.createdAt.toISOString(),
      })),
    ];

    return items.sort(
      (a, b) => +new Date(b.timestamp) - +new Date(a.timestamp),
    );
  }
}
