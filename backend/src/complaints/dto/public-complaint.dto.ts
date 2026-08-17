import { ApiProperty } from '@nestjs/swagger';
import { ComplaintStatus } from '../../common/enums/complaint-status.enum';

export class PublicComplaintUpdateDto {
  @ApiProperty()
  comment: string;

  @ApiProperty({ enum: ComplaintStatus, nullable: true })
  status_changed_to: ComplaintStatus | null;

  @ApiProperty()
  created_at: Date;
}

export class PublicComplaintDto {
  @ApiProperty()
  tracking_code: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ enum: ComplaintStatus })
  status: ComplaintStatus;

  @ApiProperty()
  department_name: string;

  @ApiProperty()
  category_name: string;

  @ApiProperty()
  location: string;

  @ApiProperty({ nullable: true })
  latitude: number | null;

  @ApiProperty({ nullable: true })
  longitude: number | null;

  @ApiProperty()
  description: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  citizen_name: string;

  @ApiProperty({ nullable: true })
  assigned_officer_name: string | null;

  @ApiProperty({ type: [PublicComplaintUpdateDto] })
  updates: PublicComplaintUpdateDto[];
}
