import { plainToInstance, Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  MinLength,
  validateSync,
} from 'class-validator';

enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @Type(() => Number)
  @IsNumber()
  PORT = 4000;

  @IsString()
  CORS_ORIGIN!: string;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  @MinLength(16)
  JWT_ACCESS_SECRET!: string;

  @Type(() => Number)
  @IsNumber()
  JWT_ACCESS_TTL = 900;

  @IsString()
  @MinLength(16)
  JWT_REFRESH_SECRET!: string;

  @Type(() => Number)
  @IsNumber()
  JWT_REFRESH_TTL = 1209600;

  @IsString()
  @MinLength(64)
  ENCRYPTION_KEY!: string;

  @Type(() => Number)
  @IsNumber()
  THROTTLE_TTL = 60;

  @Type(() => Number)
  @IsNumber()
  THROTTLE_LIMIT = 120;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(
      `Invalid environment configuration:\n${errors
        .map((e) => Object.values(e.constraints ?? {}).join(', '))
        .join('\n')}`,
    );
  }
  return validated;
}
