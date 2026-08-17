import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { ComplaintStatus } from '../../common/enums/complaint-status.enum';

export class UpdateStatusDto {
  @ApiProperty({ enum: ComplaintStatus })
  @IsEnum(ComplaintStatus)
  status: ComplaintStatus;

  @ApiPropertyOptional({ minLength: 1, maxLength: 1000 })
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  comment?: string;
}
