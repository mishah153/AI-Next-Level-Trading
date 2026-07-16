import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Streams live price ticks to connected clients over Socket.IO.
 * Random-walks the current instrument prices in memory every 1.5s.
 */
@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class MarketGateway implements OnModuleInit, OnModuleDestroy {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(MarketGateway.name);
  private prices = new Map<string, number>();
  private timer?: NodeJS.Timeout;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    try {
      const instruments = await this.prisma.instrument.findMany();
      instruments.forEach((i) => this.prices.set(i.symbol, i.price));
    } catch (error) {
      this.logger.warn(`Could not seed market feed: ${String(error)}`);
    }
    this.timer = setInterval(() => this.broadcast(), 1500);
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private broadcast(): void {
    if (!this.server) return;
    for (const [symbol, price] of this.prices) {
      const drift = (Math.random() - 0.5) * 0.002; // ±0.1%
      const next = Math.max(price * (1 + drift), 0);
      const rounded = Number(next.toFixed(price < 1 ? 6 : 2));
      this.prices.set(symbol, rounded);
      this.server.emit('tick', { symbol, price: rounded });
    }
  }
}
