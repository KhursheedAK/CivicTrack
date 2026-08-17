import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataCorrectionRequest } from './entities/data-correction-request.entity';
import { Complaint } from '../complaints/entities/complaint.entity';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import {
  COMPLAINT_CORRECTION_FIELDS,
  PROFILE_CORRECTION_FIELDS,
  DataCorrectionStatus,
  DataCorrectionTargetType,
} from '../common/enums/data-correction.enum';
import { NotificationType } from '../common/enums/notification-type.enum';
import { isNotificationPreferenceEnabled } from '../common/constants/notification-preference-keys';
import { CreateDataCorrectionRequestDto } from './dto/create-data-correction-request.dto';
import { ApproveDataCorrectionRequestDto } from './dto/approve-data-correction-request.dto';
import { RejectDataCorrectionRequestDto } from './dto/reject-data-correction-request.dto';
import {
  DataCorrectionRequestDto,
  DataCorrectionRequestListDto,
} from './dto/data-correction-request-response.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';

@Injectable()
export class DataCorrectionsService {
  constructor(
    @InjectRepository(DataCorrectionRequest)
    private readonly repo: Repository<DataCorrectionRequest>,
    @InjectRepository(Complaint)
    private readonly complaintsRepository: Repository<Complaint>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
    private readonly mailService: MailService,
  ) {}

  async create(
    officer: AuthenticatedUser,
    dto: CreateDataCorrectionRequestDto,
  ): Promise<DataCorrectionRequestDto> {
    let complaint: Complaint | null = null;

    if (dto.target_type === DataCorrectionTargetType.COMPLAINT) {
      if (!dto.complaint_id) {
        throw new BadRequestException(
          'complaint_id is required for a COMPLAINT correction request',
        );
      }
      complaint = await this.complaintsRepository.findOne({
        where: { id: dto.complaint_id },
      });
      if (!complaint) {
        throw new NotFoundException('Complaint not found');
      }
      if (complaint.department_id !== officer.department_id) {
        throw new ForbiddenException(
          'You cannot request a correction for a complaint outside your department',
        );
      }
      const invalid = dto.fields_flagged.filter(
        (f) => !(COMPLAINT_CORRECTION_FIELDS as readonly string[]).includes(f),
      );
      if (invalid.length > 0) {
        throw new BadRequestException(
          `Invalid field(s) for a complaint correction: ${invalid.join(', ')}`,
        );
      }
    } else {
      if (dto.complaint_id) {
        throw new BadRequestException(
          'complaint_id must not be set for a PROFILE correction request',
        );
      }
      const invalid = dto.fields_flagged.filter(
        (f) => !(PROFILE_CORRECTION_FIELDS as readonly string[]).includes(f),
      );
      if (invalid.length > 0) {
        throw new BadRequestException(
          `Invalid field(s) for a profile correction: ${invalid.join(', ')}`,
        );
      }
    }

    const saved = await this.repo.save(
      this.repo.create({
        requested_by_id: officer.id,
        target_type: dto.target_type,
        complaint_id: complaint?.id ?? null,
        fields_flagged: dto.fields_flagged,
        current_data: dto.current_data,
        requested_correction: dto.requested_correction,
      }),
    );

    const admins = await this.usersRepository.find({ where: { role: Role.ADMIN } });
    const requestingOfficer = await this.usersRepository.findOne({
      where: { id: officer.id },
    });
    for (const admin of admins) {
      await this.notificationsService.create(
        admin.id,
        `${requestingOfficer?.name ?? 'An officer'} requested a data correction${
          complaint ? ` on complaint #${complaint.tracking_code}` : ' to their own profile'
        }.`,
        NotificationType.DATA_CORRECTION_REQUESTED,
        saved.id,
      );
      await this.mailService.sendDataCorrectionRequestedEmail(
        admin.email,
        requestingOfficer?.name ?? 'An officer',
      );
    }

    return this.mapToDto(await this.loadFull(saved.id));
  }

  async findAll(status?: DataCorrectionStatus): Promise<DataCorrectionRequestListDto> {
    const where = status ? { status } : {};
    const [rows, total] = await this.repo.findAndCount({
      where,
      relations: { requested_by: true, complaint: true, resolved_by: true },
      order: { created_at: 'DESC' },
    });
    return { items: rows.map((r) => this.mapToDto(r)), total };
  }

  async findMine(officerId: string): Promise<DataCorrectionRequestListDto> {
    const [rows, total] = await this.repo.findAndCount({
      where: { requested_by_id: officerId },
      relations: { requested_by: true, complaint: true, resolved_by: true },
      order: { created_at: 'DESC' },
    });
    return { items: rows.map((r) => this.mapToDto(r)), total };
  }

  async findOne(
    id: string,
    requestingUser: AuthenticatedUser,
  ): Promise<DataCorrectionRequestDto> {
    const row = await this.loadFull(id);
    if (requestingUser.role !== Role.ADMIN && row.requested_by_id !== requestingUser.id) {
      throw new ForbiddenException('You cannot view this request');
    }
    return this.mapToDto(row);
  }

  async approve(
    id: string,
    admin: AuthenticatedUser,
    dto: ApproveDataCorrectionRequestDto,
  ): Promise<DataCorrectionRequestDto> {
    const row = await this.loadFull(id);
    if (row.status !== DataCorrectionStatus.PENDING) {
      throw new BadRequestException('This request has already been resolved');
    }

    if (row.target_type === DataCorrectionTargetType.COMPLAINT) {
      await this.applyComplaintCorrection(row, dto);
    } else {
      await this.applyProfileCorrection(row, dto);
    }

    row.status = DataCorrectionStatus.APPROVED;
    row.admin_notes = dto.admin_notes ?? null;
    row.resolved_by_id = admin.id;
    row.resolved_at = new Date();
    await this.repo.save(row);

    await this.notifyResolution(row, true);

    return this.mapToDto(await this.loadFull(id));
  }

  async reject(
    id: string,
    admin: AuthenticatedUser,
    dto: RejectDataCorrectionRequestDto,
  ): Promise<DataCorrectionRequestDto> {
    const row = await this.loadFull(id);
    if (row.status !== DataCorrectionStatus.PENDING) {
      throw new BadRequestException('This request has already been resolved');
    }

    row.status = DataCorrectionStatus.REJECTED;
    row.admin_notes = dto.admin_notes;
    row.resolved_by_id = admin.id;
    row.resolved_at = new Date();
    await this.repo.save(row);

    await this.notifyResolution(row, false);

    return this.mapToDto(await this.loadFull(id));
  }

  private async applyComplaintCorrection(
    row: DataCorrectionRequest,
    dto: ApproveDataCorrectionRequestDto,
  ): Promise<void> {
    if (!row.complaint_id) {
      throw new BadRequestException('This request has no associated complaint');
    }
    const complaint = await this.complaintsRepository.findOne({
      where: { id: row.complaint_id },
    });
    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    const nextDepartmentId = dto.department_id ?? complaint.department_id;

    if (dto.category_id) {
      const category = await this.categoriesRepository.findOne({
        where: { id: dto.category_id },
      });
      if (!category) {
        throw new BadRequestException('Category not found');
      }
      if (category.department_id !== nextDepartmentId) {
        throw new BadRequestException(
          'Selected category does not belong to the selected department',
        );
      }
      complaint.category_id = dto.category_id;
    }
    if (dto.department_id) complaint.department_id = dto.department_id;
    if (dto.location) complaint.location = dto.location;
    if (dto.title) complaint.title = dto.title;
    if (dto.description) complaint.description = dto.description;

    await this.complaintsRepository.save(complaint);
  }

  private async applyProfileCorrection(
    row: DataCorrectionRequest,
    dto: ApproveDataCorrectionRequestDto,
  ): Promise<void> {
    await this.usersService.update(row.requested_by_id, {
      name: dto.name,
      department_id: dto.own_department_id,
    });
  }

  private async notifyResolution(
    row: DataCorrectionRequest,
    approved: boolean,
  ): Promise<void> {
    const officer = await this.usersRepository.findOne({
      where: { id: row.requested_by_id },
    });
    if (!officer) return;

    const target = row.complaint_id
      ? `complaint #${row.complaint?.tracking_code ?? ''}`
      : 'your profile';
    const message = approved
      ? `Your data correction request for ${target} was approved.`
      : `Your data correction request for ${target} was rejected: ${row.admin_notes}`;

    await this.notificationsService.create(
      officer.id,
      message,
      NotificationType.DATA_CORRECTION_RESOLVED,
      row.id,
    );

    if (
      isNotificationPreferenceEnabled(officer.notification_preferences, 'correction-updates')
    ) {
      await this.mailService.sendDataCorrectionResolvedEmail(
        officer.email,
        approved,
        row.admin_notes,
      );
    }
  }

  private async loadFull(id: string): Promise<DataCorrectionRequest> {
    const row = await this.repo.findOne({
      where: { id },
      relations: { requested_by: true, complaint: true, resolved_by: true },
    });
    if (!row) {
      throw new NotFoundException('Data correction request not found');
    }
    return row;
  }

  private mapToDto(row: DataCorrectionRequest): DataCorrectionRequestDto {
    return {
      id: row.id,
      requested_by: {
        id: row.requested_by.id,
        name: row.requested_by.name,
        email: row.requested_by.email,
      },
      target_type: row.target_type,
      complaint: row.complaint
        ? {
            id: row.complaint.id,
            tracking_code: row.complaint.tracking_code,
            title: row.complaint.title,
          }
        : null,
      fields_flagged: row.fields_flagged,
      current_data: row.current_data,
      requested_correction: row.requested_correction,
      status: row.status,
      admin_notes: row.admin_notes,
      resolved_by_name: row.resolved_by?.name ?? null,
      resolved_at: row.resolved_at,
      created_at: row.created_at,
    };
  }
}
