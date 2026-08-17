import { ApiProperty } from '@nestjs/swagger';

export class AnalyticsStatsDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  open: number;

  @ApiProperty()
  resolved: number;

  @ApiProperty()
  closed: number;

  @ApiProperty()
  rejected: number;

  @ApiProperty()
  avg_resolution_days: number;
}
