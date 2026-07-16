import { ApiProperty } from '@nestjs/swagger';
import { RiskProfile, SubscriptionTier } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiProperty({ enum: RiskProfile, required: false })
  @IsOptional()
  @IsEnum(RiskProfile)
  riskProfile?: RiskProfile;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  mfaEnabled?: boolean;

  @ApiProperty({ enum: SubscriptionTier, required: false })
  @IsOptional()
  @IsEnum(SubscriptionTier)
  tier?: SubscriptionTier;
}
