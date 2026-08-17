import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { AnalyticsService } from './analytics.service';
import { AnalyticsStatsDto } from './dto/analytics-stats.dto';
import {
  AnalyticsByCategoryDto,
  AnalyticsByDepartmentDto,
  AnalyticsByStatusDto,
} from './dto/analytics-grouped.dto';
import { ComplaintSummaryDto } from '../complaints/dto/complaint-summary.dto';

@ApiTags('admin-analytics')
@ApiBearerAuth()
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Overall complaint stats (Admin only)' })
  getStats(): Promise<AnalyticsStatsDto> {
    return this.analyticsService.getStats();
  }

  @Get('by-category')
  @ApiOperation({ summary: 'Complaint counts grouped by category (Admin only)' })
  getByCategory(): Promise<AnalyticsByCategoryDto[]> {
    return this.analyticsService.getByCategory();
  }

  @Get('by-status')
  @ApiOperation({ summary: 'Complaint counts grouped by status (Admin only)' })
  getByStatus(): Promise<AnalyticsByStatusDto[]> {
    return this.analyticsService.getByStatus();
  }

  @Get('by-department')
  @ApiOperation({ summary: 'Complaint counts grouped by department (Admin only)' })
  getByDepartment(): Promise<AnalyticsByDepartmentDto[]> {
    return this.analyticsService.getByDepartment();
  }

  @Get('recent')
  @ApiOperation({ summary: 'Last 10 complaints (Admin only)' })
  getRecent(): Promise<ComplaintSummaryDto[]> {
    return this.analyticsService.getRecent();
  }
}
