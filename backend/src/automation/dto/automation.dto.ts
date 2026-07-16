import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateStrategyDto {
  @ApiProperty({ example: 'Whale Reversal Hunter' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiProperty({ example: 'crypto', description: 'MarketKind or "all"' })
  @IsString()
  scope!: string;

  @ApiProperty({
    minimum: 0,
    maximum: 100,
    description: '0=conservative, 100=aggressive',
  })
  @IsInt()
  @Min(0)
  @Max(100)
  riskLevel!: number;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @Min(0)
  spendingLimitUsd!: number;

  @ApiProperty({ example: 'BUY signals · confidence ≥ 80%' })
  @IsString()
  follows!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  connectionId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  autoExecute?: boolean;
}

export class UpdateStrategyDto extends PartialType(CreateStrategyDto) {}
