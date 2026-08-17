import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { DataCorrectionTargetType } from '../../common/enums/data-correction.enum';

export class CreateDataCorrectionRequestDto {
  @ApiProperty({ enum: DataCorrectionTargetType })
  @IsEnum(DataCorrectionTargetType)
  target_type: DataCorrectionTargetType;

  @ApiProperty({ required: false, description: 'Required when target_type is COMPLAINT' })
  @IsOptional()
  @IsUUID()
  complaint_id?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  fields_flagged: string[];

  @ApiProperty()
  @IsString()
  @Length(3, 2000)
  current_data: string;

  @ApiProperty()
  @IsString()
  @Length(3, 2000)
  requested_correction: string;
}
