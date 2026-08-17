import { ApiProperty } from '@nestjs/swagger';
import {
  DataCorrectionStatus,
  DataCorrectionTargetType,
} from '../../common/enums/data-correction.enum';

class RequestedByDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() email: string;
}

class ComplaintRefDto {
  @ApiProperty() id: string;
  @ApiProperty() tracking_code: string;
  @ApiProperty() title: string;
}

export class DataCorrectionRequestDto {
  @ApiProperty() id: string;
  @ApiProperty({ type: RequestedByDto }) requested_by: RequestedByDto;
  @ApiProperty({ enum: DataCorrectionTargetType }) target_type: DataCorrectionTargetType;
  @ApiProperty({ type: ComplaintRefDto, nullable: true }) complaint: ComplaintRefDto | null;
  @ApiProperty({ type: [String] }) fields_flagged: string[];
  @ApiProperty() current_data: string;
  @ApiProperty() requested_correction: string;
  @ApiProperty({ enum: DataCorrectionStatus }) status: DataCorrectionStatus;
  @ApiProperty({ nullable: true }) admin_notes: string | null;
  @ApiProperty({ nullable: true }) resolved_by_name: string | null;
  @ApiProperty({ nullable: true }) resolved_at: Date | null;
  @ApiProperty() created_at: Date;
}

export class DataCorrectionRequestListDto {
  @ApiProperty({ type: [DataCorrectionRequestDto] })
  items: DataCorrectionRequestDto[];

  @ApiProperty()
  total: number;
}
