import { ApiProperty } from '@nestjs/swagger';

export class DepartmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  category_count: number;

  @ApiProperty()
  officer_count: number;

  @ApiProperty({ description: 'Complaints not yet RESOLVED, CLOSED, or REJECTED' })
  open_complaint_count: number;

  @ApiProperty()
  created_at: Date;
}
