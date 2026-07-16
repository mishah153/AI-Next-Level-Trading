import { Injectable, NotFoundException } from '@nestjs/common';
import { ExchangeConnection } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../common/crypto/crypto.service';
import { CreateConnectionDto } from './dto/create-connection.dto';

/** Public shape — never exposes encrypted secrets. */
type SafeConnection = Omit<ExchangeConnection, 'apiKeyEnc' | 'apiSecretEnc'> & {
  apiKeyMasked: string;
};

@Injectable()
export class ConnectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
  ) {}

  async findAll(userId: string): Promise<SafeConnection[]> {
    const rows = await this.prisma.exchangeConnection.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.toSafe(r));
  }

  async create(
    userId: string,
    dto: CreateConnectionDto,
  ): Promise<SafeConnection> {
    const created = await this.prisma.exchangeConnection.create({
      data: {
        userId,
        provider: dto.provider,
        label: dto.label,
        market: dto.market,
        apiKeyEnc: this.crypto.encrypt(dto.apiKey),
        apiSecretEnc: this.crypto.encrypt(dto.apiSecret),
        permissions: dto.permissions ?? ['Read'],
        mfaEnabled: dto.mfaEnabled ?? false,
        connectedAt: new Date(),
      },
    });
    return this.toSafe(created);
  }

  async remove(userId: string, id: string): Promise<{ success: true }> {
    const existing = await this.prisma.exchangeConnection.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new NotFoundException('Connection not found');
    await this.prisma.exchangeConnection.delete({ where: { id } });
    return { success: true };
  }

  private toSafe(row: ExchangeConnection): SafeConnection {
    const { apiKeyEnc, apiSecretEnc, ...rest } = row;
    return {
      ...rest,
      apiKeyMasked: this.crypto.mask(this.crypto.decrypt(apiKeyEnc)),
    };
  }
}
