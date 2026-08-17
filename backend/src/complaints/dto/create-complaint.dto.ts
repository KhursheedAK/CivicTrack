import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';
import { AttachmentInputDto } from './attachment-input.dto';

export class CreateComplaintDto {
  @ApiProperty({ minLength: 10, maxLength: 200 })
  @IsString()
  @Length(10, 200)
  title: string;

  @ApiProperty({ minLength: 30, maxLength: 2000 })
  @IsString()
  @Length(30, 2000)
  description: string;

  @ApiProperty({ minLength: 5, maxLength: 200 })
  @IsString()
  @Length(5, 200)
  location: string;

  @ApiProperty()
  @IsUUID()
  category_id: string;

  @ApiProperty()
  @IsUUID()
  department_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @ApiPropertyOptional({ type: [AttachmentInputDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => AttachmentInputDto)
  attachments?: AttachmentInputDto[];
}
