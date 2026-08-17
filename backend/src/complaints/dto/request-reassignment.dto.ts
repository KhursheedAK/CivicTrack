import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RequestReassignmentDto {
  @ApiProperty({ description: 'Reason for requesting reassignment' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}
