import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  department_id: string;

  @ApiProperty()
  department_name: string;

  @ApiProperty()
  is_active: boolean;
}
