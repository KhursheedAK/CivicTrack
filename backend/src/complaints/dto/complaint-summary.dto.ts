import { ApiProperty } from '@nestjs/swagger';
import { ComplaintStatus } from '../../common/enums/complaint-status.enum';

export class ComplaintSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tracking_code: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ enum: ComplaintStatus })
  status: ComplaintStatus;

  @ApiProperty()
  category_name: string;

  @ApiProperty()
  department_name: string;

  @ApiProperty()
  citizen_name: string;

  @ApiProperty({ nullable: true })
  assigned_officer_name: string | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty()
  attachment_count: number;
}

export class PaginatedComplaintsDto {
  @ApiProperty({ type: [ComplaintSummaryDto] })
  items: ComplaintSummaryDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
