import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID, Length, ValidateIf } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ minLength: 2, maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  department_id?: string | null;

  @ApiPropertyOptional({
    description:
      'Blocks the citizen from submitting new complaints or comments. Existing complaints remain visible/trackable.',
  })
  @IsOptional()
  @IsBoolean()
  is_blocked?: boolean;
}
