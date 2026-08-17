import { ApiProperty } from '@nestjs/swagger';
import { ComplaintStatus } from '../../common/enums/complaint-status.enum';

export class RefDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class CitizenRefDto extends RefDto {
  @ApiProperty()
  email: string;
}

export class AttachmentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  file_url: string;

  @ApiProperty()
  file_name: string;

  @ApiProperty()
  mime_type: string;
}

export class UpdateAuthorDto extends RefDto {
  @ApiProperty()
  role: string;
}

export class ComplaintUpdateDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  comment: string;

  @ApiProperty({ enum: ComplaintStatus, nullable: true })
  status_changed_to: ComplaintStatus | null;

  @ApiProperty({ type: UpdateAuthorDto })
  author: UpdateAuthorDto;

  @ApiProperty()
  created_at: Date;
}

export class ComplaintDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tracking_code: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  location: string;

  @ApiProperty({ nullable: true })
  latitude: number | null;

  @ApiProperty({ nullable: true })
  longitude: number | null;

  @ApiProperty({ enum: ComplaintStatus })
  status: ComplaintStatus;

  @ApiProperty({ type: CitizenRefDto })
  citizen: CitizenRefDto;

  @ApiProperty({ type: RefDto })
  department: RefDto;

  @ApiProperty({ type: RefDto })
  category: RefDto;

  @ApiProperty({ type: RefDto, nullable: true })
  assigned_officer: RefDto | null;

  @ApiProperty({ type: [AttachmentDto] })
  attachments: AttachmentDto[];

  @ApiProperty({ type: [ComplaintUpdateDto] })
  updates: ComplaintUpdateDto[];

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty({ nullable: true })
  resolved_at: Date | null;

  @ApiProperty({ description: 'True if a reassignment request is pending admin review' })
  reassignment_requested: boolean;

  @ApiProperty({ nullable: true, description: 'Reason stated for reassignment request' })
  reassignment_reason: string | null;

  @ApiProperty({ description: 'True if admin has rejected a prior reassignment request (blocks further requests)' })
  reassignment_rejected: boolean;
}
