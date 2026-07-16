import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Alex Morgan' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @ApiProperty({ example: 'alex@ainextleveltrading.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Sup3rSecret!', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/[0-9]/, { message: 'Password must contain at least one number' })
  password!: string;
}
