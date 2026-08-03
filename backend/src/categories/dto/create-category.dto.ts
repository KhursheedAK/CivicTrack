import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, Length } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ minLength: 2, maxLength: 100 })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiProperty()
  @IsUUID()
  department_id: string;
}
