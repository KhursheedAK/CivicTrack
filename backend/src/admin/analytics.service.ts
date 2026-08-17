import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Complaint } from '../complaints/entities/complaint.entity';
import { ComplaintStatus } from '../common/enums/complaint-status.enum';
import { ComplaintSummaryDto } from '../complaints/dto/complaint-summary.dto';
import { AnalyticsStatsDto } from './dto/analytics-stats.dto';
import {
  AnalyticsByCategoryDto,
  AnalyticsByDepartmentDto,
  AnalyticsByStatusDto,
} from './dto/analytics-grouped.dto';

const OPEN_STATUSES = [
  ComplaintStatus.SUBMITTED,
  ComplaintStatus.UNDER_REVIEW,
  ComplaintStatus.IN_PROGRESS,
];

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Complaint)
    private readonly complaintsRepository: Repository<Complaint>,
  ) {}

  async getStats(): Promise<AnalyticsStatsDto> {
    const total = await this.complaintsRepository.count();
    const open = await this.complaintsRepository.count({
      where: OPEN_STATUSES.map((status) => ({ status })),
    });
    const resolved = await this.complaintsRepository.count({
      where: { status: ComplaintStatus.RESOLVED },
    });
    const closed = await this.complaintsRepository.count({
      where: { status: ComplaintStatus.CLOSED },
    });
    const rejected = await this.complaintsRepository.count({
      where: { status: ComplaintStatus.REJECTED },
    });

    const avgResult = await this.complaintsRepository
      .createQueryBuilder('complaint')
      .select(
        'AVG(EXTRACT(EPOCH FROM (complaint.resolved_at - complaint.created_at)) / 86400)',
        'avg_days',
      )
      .where('complaint.resolved_at IS NOT NULL')
      .getRawOne<{ avg_days: string | null }>();

    const avg_resolution_days = avgResult?.avg_days
      ? Math.round(parseFloat(avgResult.avg_days) * 10) / 10
      : 0;

    return { total, open, resolved, closed, rejected, avg_resolution_days };
  }

  async getByCategory(): Promise<AnalyticsByCategoryDto[]> {
    const rows = await this.complaintsRepository
      .createQueryBuilder('complaint')
      .innerJoin('complaint.category', 'category')
      .select('category.name', 'category_name')
      .addSelect('COUNT(complaint.id)', 'count')
      .groupBy('category.name')
      .orderBy('count', 'DESC')
      .getRawMany<{ category_name: string; count: string }>();

    return rows.map((row) => ({
      category_name: row.category_name,
      count: parseInt(row.count, 10),
    }));
  }

  async getByStatus(): Promise<AnalyticsByStatusDto[]> {
    const rows = await this.complaintsRepository
      .createQueryBuilder('complaint')
      .select('complaint.status', 'status')
      .addSelect('COUNT(complaint.id)', 'count')
      .groupBy('complaint.status')
      .orderBy('count', 'DESC')
      .getRawMany<{ status: ComplaintStatus; count: string }>();

    return rows.map((row) => ({
      status: row.status,
      count: parseInt(row.count, 10),
    }));
  }

  async getByDepartment(): Promise<AnalyticsByDepartmentDto[]> {
    const rows = await this.complaintsRepository
      .createQueryBuilder('complaint')
      .innerJoin('complaint.department', 'department')
      .select('department.name', 'department_name')
      .addSelect('COUNT(complaint.id)', 'count')
      .groupBy('department.name')
      .orderBy('count', 'DESC')
      .getRawMany<{ department_name: string; count: string }>();

    return rows.map((row) => ({
      department_name: row.department_name,
      count: parseInt(row.count, 10),
    }));
  }

  async getRecent(): Promise<ComplaintSummaryDto[]> {
    const complaints = await this.complaintsRepository
      .createQueryBuilder('complaint')
      .leftJoinAndSelect('complaint.citizen', 'citizen')
      .leftJoinAndSelect('complaint.department', 'department')
      .leftJoinAndSelect('complaint.category', 'category')
      .leftJoinAndSelect('complaint.assigned_officer', 'assigned_officer')
      .leftJoinAndSelect('complaint.attachments', 'attachments')
      .orderBy('complaint.created_at', 'DESC')
      .take(10)
      .getMany();

    return complaints.map((complaint) => ({
      id: complaint.id,
      tracking_code: complaint.tracking_code,
      title: complaint.title,
      status: complaint.status,
      category_name: complaint.category?.name ?? '',
      department_name: complaint.department?.name ?? '',
      citizen_name: complaint.citizen?.name ?? '',
      assigned_officer_name: complaint.assigned_officer?.name ?? null,
      created_at: complaint.created_at,
      updated_at: complaint.updated_at,
      attachment_count: complaint.attachments?.length ?? 0,
    }));
  }
}
