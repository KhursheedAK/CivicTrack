import { ApiProperty } from '@nestjs/swagger';
import { ComplaintStatus } from '../../common/enums/complaint-status.enum';

export class CreateComplaintResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tracking_code: string;

  @ApiProperty({ enum: ComplaintStatus })
  status: ComplaintStatus;

  @ApiProperty()
  created_at: Date;
}
