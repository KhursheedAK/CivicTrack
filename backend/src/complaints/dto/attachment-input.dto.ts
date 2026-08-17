import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AttachmentInputDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  file_url: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  file_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  mime_type: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cloudinary_public_id: string;
}
