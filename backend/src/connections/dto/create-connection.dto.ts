import { ApiProperty } from '@nestjs/swagger';
import { ExchangeProvider, MarketKind } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateConnectionDto {
  @ApiProperty({ enum: ExchangeProvider })
  @IsEnum(ExchangeProvider)
  provider!: ExchangeProvider;

  @ApiProperty({ example: 'Binance — Main' })
  @IsString()
  @MinLength(2)
  label!: string;

  @ApiProperty({ enum: MarketKind })
  @IsEnum(MarketKind)
  market!: MarketKind;

  @ApiProperty({ description: 'Exchange API key (stored AES-256 encrypted)' })
  @IsString()
  apiKey!: string;

  @ApiProperty({
    description: 'Exchange API secret (stored AES-256 encrypted)',
  })
  @IsString()
  apiSecret!: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  mfaEnabled?: boolean;
}
