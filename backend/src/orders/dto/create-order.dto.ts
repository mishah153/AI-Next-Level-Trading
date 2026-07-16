import { ApiProperty } from '@nestjs/swagger';
import { MarketKind, OrderSide, OrderType } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 'BTC/USDT' })
  @IsString()
  symbol!: string;

  @ApiProperty({ enum: MarketKind })
  @IsEnum(MarketKind)
  market!: MarketKind;

  @ApiProperty({ enum: OrderSide })
  @IsEnum(OrderSide)
  side!: OrderSide;

  @ApiProperty({ enum: OrderType })
  @IsEnum(OrderType)
  type!: OrderType;

  @ApiProperty({
    required: false,
    description: 'Required for limit/stop orders',
  })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ example: 0.5 })
  @IsNumber()
  @IsPositive()
  size!: number;
}
