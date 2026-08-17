import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class RejectDataCorrectionRequestDto {
  @ApiProperty({ description: 'Reason shown to the requesting officer' })
  @IsString()
  @Length(3, 1000)
  admin_notes: string;
}
