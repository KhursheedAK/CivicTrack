import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty()
  file_url: string;

  @ApiProperty()
  file_name: string;

  @ApiProperty()
  mime_type: string;

  @ApiProperty()
  cloudinary_public_id: string;
}
