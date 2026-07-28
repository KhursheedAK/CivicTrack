import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiPropertyOptional({
    description: 'Extend the refresh token lifetime for this device (30d instead of 7d).',
  })
  @IsOptional()
  @IsBoolean()
  remember?: boolean;
}
