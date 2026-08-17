import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ComplaintStatus } from '../../common/enums/complaint-status.enum';

export class ListComplaintsQueryDto {
  @ApiPropertyOptional({ enum: ComplaintStatus })
  @IsOptional()
  @IsEnum(ComplaintStatus)
  status?: ComplaintStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  department_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  assigned_officer_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  citizen_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ default: 'created_at' })
  @IsOptional()
  @IsIn(['created_at', 'updated_at'])
  sort?: 'created_at' | 'updated_at' = 'created_at';

  @ApiPropertyOptional({ default: 'DESC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'DESC';
}
