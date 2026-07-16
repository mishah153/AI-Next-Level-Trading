import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string, status?: OrderStatus) {
    const where: Prisma.OrderWhereInput = { userId };
    if (status) where.status = status;
    return this.prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  create(userId: string, dto: CreateOrderDto) {
    if (dto.type !== 'market' && dto.price == null) {
      throw new BadRequestException('Limit and stop orders require a price');
    }
    return this.prisma.order.create({
      data: {
        userId,
        symbol: dto.symbol,
        market: dto.market,
        side: dto.side,
        type: dto.type,
        price: dto.type === 'market' ? null : dto.price,
        size: dto.size,
        status: dto.type === 'market' ? 'filled' : 'open',
        filledPct: dto.type === 'market' ? 100 : 0,
        source: 'manual',
      },
    });
  }

  async cancel(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({ where: { id, userId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'open' && order.status !== 'partial') {
      throw new BadRequestException('Only open orders can be canceled');
    }
    return this.prisma.order.update({
      where: { id },
      data: { status: 'canceled' },
    });
  }
}
