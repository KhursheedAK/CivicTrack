import { ApiProperty } from '@nestjs/swagger';
import { ComplaintStatus } from '../../common/enums/complaint-status.enum';

export class AnalyticsByCategoryDto {
  @ApiProperty()
  category_name: string;

  @ApiProperty()
  count: number;
}

export class AnalyticsByStatusDto {
  @ApiProperty({ enum: ComplaintStatus })
  status: ComplaintStatus;

  @ApiProperty()
  count: number;
}

export class AnalyticsByDepartmentDto {
  @ApiProperty()
  department_name: string;

  @ApiProperty()
  count: number;
}
