import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class AddCommentDto {
  @ApiProperty({ minLength: 1, maxLength: 1000 })
  @IsString()
  @Length(1, 1000)
  comment: string;
}
