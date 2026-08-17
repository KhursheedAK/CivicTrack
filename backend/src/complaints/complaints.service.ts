import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Complaint } from './entities/complaint.entity';
import { ComplaintAttachment } from './entities/complaint-attachment.entity';
import { ComplaintUpdate } from './entities/complaint-update.entity';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import { ComplaintStatus } from '../common/enums/complaint-status.enum';
import { NotificationType } from '../common/enums/notification-type.enum';
import { generateTrackingCode } from '../common/helpers/tracking-code.helper';
import { isNotificationPreferenceEnabled } from '../common/constants/notification-preference-keys';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { AssignOfficerDto } from './dto/assign-officer.dto';
import { RequestReassignmentDto } from './dto/request-reassignment.dto';
import { ListComplaintsQueryDto } from './dto/list-complaints-query.dto';
import { CreateComplaintResponseDto } from './dto/create-complaint-response.dto';
import {
  ComplaintSummaryDto,
  PaginatedComplaintsDto,
} from './dto/complaint-summary.dto';
import { ComplaintDetailDto } from './dto/complaint-detail.dto';
import { PublicComplaintDto } from './dto/public-complaint.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';
import { UploadService } from '../upload/upload.service';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';

const ALLOWED_TRANSITIONS: Record<ComplaintStatus, ComplaintStatus[]> = {
  [ComplaintStatus.SUBMITTED]: [ComplaintStatus.UNDER_REVIEW],
  [ComplaintStatus.UNDER_REVIEW]: [
    ComplaintStatus.IN_PROGRESS,
    ComplaintStatus.REJECTED,
  ],
  [ComplaintStatus.IN_PROGRESS]: [ComplaintStatus.RESOLVED],
  [ComplaintStatus.RESOLVED]: [ComplaintStatus.CLOSED],
  [ComplaintStatus.CLOSED]: [],
  [ComplaintStatus.REJECTED]: [],
};

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectRepository(Complaint)
    private readonly complaintsRepository: Repository<Complaint>,
    @InjectRepository(ComplaintUpdate)
    private readonly complaintUpdatesRepository: Repository<ComplaintUpdate>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
    private readonly mailService: MailService,
    private readonly uploadService: UploadService,
  ) {}

  async create(
    citizenId: string,
    dto: CreateComplaintDto,
  ): Promise<CreateComplaintResponseDto> {
    const citizenRecord = await this.usersRepository.findOne({
      where: { id: citizenId },
    });
    if (citizenRecord?.is_blocked) {
      throw new ForbiddenException(
        'Your account has been blocked from submitting new complaints. Contact support for assistance.',
      );
    }

    const category = await this.categoriesRepository.findOne({
      where: { id: dto.category_id },
      relations: { department: true },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    if (category.department_id !== dto.department_id) {
      throw new BadRequestException(
        'Selected category does not belong to the selected department',
      );
    }

    if (!category.department.is_active) {
      throw new BadRequestException(
        'Selected department is no longer accepting complaints',
      );
    }

    if (!category.is_active) {
      throw new BadRequestException(
        'Selected category is no longer accepting complaints',
      );
    }

    const trackingCode = await generateTrackingCode(this.complaintsRepository);

    const complaint = this.complaintsRepository.create({
      tracking_code: trackingCode,
      title: dto.title,
      description: dto.description,
      location: dto.location,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
      status: ComplaintStatus.SUBMITTED,
      citizen_id: citizenId,
      department_id: dto.department_id,
      category_id: dto.category_id,
    });

    if (dto.attachments?.length) {
      complaint.attachments = dto.attachments.map((attachment) => {
        const entity = new ComplaintAttachment();
        entity.file_url = attachment.file_url;
        entity.file_name = attachment.file_name;
        entity.mime_type = attachment.mime_type;
        entity.cloudinary_public_id = attachment.cloudinary_public_id;
        return entity;
      });
    }

    const saved = await this.complaintsRepository.save(complaint);

    await this.complaintUpdatesRepository.save(
      this.complaintUpdatesRepository.create({
        complaint_id: saved.id,
        author_id: citizenId,
        comment: 'Complaint submitted',
        status_changed_to: null,
      }),
    );

    if (citizenRecord) {
      await this.mailService.sendComplaintConfirmationEmail(
        citizenRecord.email,
        saved.tracking_code,
      );
    }

    const departmentOfficers = await this.usersRepository.find({
      where: { role: Role.OFFICER, department_id: dto.department_id },
      relations: { department: true },
    });

    // Auto-assign: officer with fewest active complaints, random if tied at 0
    const assignedOfficer = await this.pickOfficer(departmentOfficers, saved.id);
    if (assignedOfficer) {
      saved.assigned_officer_id = assignedOfficer.id;
      await this.complaintsRepository.save(saved);
      await this.complaintUpdatesRepository.save(
        this.complaintUpdatesRepository.create({
          complaint_id: saved.id,
          author_id: assignedOfficer.id,
          comment: `Auto-assigned to ${assignedOfficer.name}`,
          status_changed_to: null,
        }),
      );
    }

    for (const officer of departmentOfficers) {
      await this.notificationsService.create(
        officer.id,
        `New complaint #${saved.tracking_code} submitted in your department: ${saved.title}`,
        NotificationType.NEW_COMPLAINT,
        saved.id,
      );
      if (
        isNotificationPreferenceEnabled(
          officer.notification_preferences,
          'new-complaints',
        )
      ) {
        await this.mailService.sendNewComplaintEmail(
          officer.email,
          saved.tracking_code,
          saved.title,
          officer.department?.name ?? 'your department',
        );
      }
    }

    return {
      id: saved.id,
      tracking_code: saved.tracking_code,
      status: saved.status,
      created_at: saved.created_at,
    };
  }

  async findAll(
    requestingUser: AuthenticatedUser,
    query: ListComplaintsQueryDto,
  ): Promise<PaginatedComplaintsDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sort = query.sort ?? 'created_at';
    const order = query.order ?? 'DESC';

    const qb = this.buildBaseQuery();

    if (requestingUser.role === Role.OFFICER) {
      qb.andWhere('complaint.assigned_officer_id = :officerId', {
        officerId: requestingUser.id,
      });
    }

    this.applyFilters(qb, query);

    qb.orderBy(`complaint.${sort}`, order)
      .skip((page - 1) * limit)
      .take(limit);

    const [complaints, total] = await qb.getManyAndCount();

    return {
      items: complaints.map((complaint) => this.toSummaryDto(complaint)),
      total,
      page,
      limit,
    };
  }

  async findMine(
    citizenId: string,
    query: ListComplaintsQueryDto,
  ): Promise<PaginatedComplaintsDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sort = query.sort ?? 'created_at';
    const order = query.order ?? 'DESC';

    const qb = this.buildBaseQuery().andWhere(
      'complaint.citizen_id = :citizenId',
      { citizenId },
    );

    this.applyFilters(qb, query);

    qb.orderBy(`complaint.${sort}`, order)
      .skip((page - 1) * limit)
      .take(limit);

    const [complaints, total] = await qb.getManyAndCount();

    return {
      items: complaints.map((complaint) => this.toSummaryDto(complaint)),
      total,
      page,
      limit,
    };
  }

  async findByTrackingCode(code: string): Promise<PublicComplaintDto> {
    const complaint = await this.complaintsRepository.findOne({
      where: { tracking_code: code },
      relations: { department: true, category: true, updates: true, citizen: true, assigned_officer: true },
    });

    if (!complaint) {
      throw new NotFoundException('No complaint found with this tracking code.');
    }

    const updates = (complaint.updates ?? []).sort(
      (a, b) => a.created_at.getTime() - b.created_at.getTime(),
    );

    return {
      tracking_code: complaint.tracking_code,
      title: complaint.title,
      description: complaint.description,
      status: complaint.status,
      department_name: complaint.department.name,
      category_name: complaint.category.name,
      location: complaint.location,
      latitude: complaint.latitude,
      longitude: complaint.longitude,
      created_at: complaint.created_at,
      citizen_name: complaint.citizen.name,
      assigned_officer_name: complaint.assigned_officer?.name ?? null,
      updates: updates.map((update) => ({
        comment: update.comment,
        status_changed_to: update.status_changed_to,
        created_at: update.created_at,
      })),
    };
  }

  async findById(
    id: string,
    requestingUser: AuthenticatedUser,
  ): Promise<ComplaintDetailDto> {
    const complaint = await this.loadFullComplaint(id);
    this.assertCanView(complaint, requestingUser);
    return this.toDetailDto(complaint);
  }

  async updateStatus(
    id: string,
    dto: UpdateStatusDto,
    requestingUser: AuthenticatedUser,
  ): Promise<ComplaintDetailDto> {
    const complaint = await this.loadFullComplaint(id);
    this.assertCanTransition(complaint, dto.status, requestingUser);

    if (dto.status === ComplaintStatus.REJECTED && !dto.comment) {
      throw new BadRequestException(
        'A comment is required when rejecting a complaint',
      );
    }

    complaint.status = dto.status;
    if (dto.status === ComplaintStatus.RESOLVED) {
      complaint.resolved_at = new Date();
    }

    await this.complaintsRepository.save(complaint);

    await this.complaintUpdatesRepository.save(
      this.complaintUpdatesRepository.create({
        complaint_id: complaint.id,
        author_id: requestingUser.id,
        comment: dto.comment ?? `Status updated to ${dto.status}`,
        status_changed_to: dto.status,
      }),
    );

    await this.notificationsService.create(
      complaint.citizen_id,
      `Your complaint #${complaint.tracking_code} status changed to ${dto.status}.`,
      NotificationType.STATUS_CHANGED,
      complaint.id,
    );

    if (
      isNotificationPreferenceEnabled(
        complaint.citizen.notification_preferences,
        'status-updates',
      )
    ) {
      await this.mailService.sendStatusChangeEmail(
        complaint.citizen.email,
        complaint.tracking_code,
        dto.status,
      );
    }

    const updated = await this.loadFullComplaint(id);
    return this.toDetailDto(updated);
  }

  async addComment(
    id: string,
    dto: AddCommentDto,
    requestingUser: AuthenticatedUser,
  ): Promise<ComplaintDetailDto> {
    const complaint = await this.loadFullComplaint(id);
    this.assertCanView(complaint, requestingUser);

    if (
      complaint.status === ComplaintStatus.CLOSED ||
      complaint.status === ComplaintStatus.REJECTED
    ) {
      throw new BadRequestException(
        'This complaint is closed to further comments',
      );
    }

    const author = await this.usersRepository.findOne({
      where: { id: requestingUser.id },
    });

    if (requestingUser.role === Role.CITIZEN && author?.is_blocked) {
      throw new ForbiddenException(
        'Your account has been blocked from posting new comments. Contact support for assistance.',
      );
    }

    await this.complaintUpdatesRepository.save(
      this.complaintUpdatesRepository.create({
        complaint_id: complaint.id,
        author_id: requestingUser.id,
        comment: dto.comment,
        status_changed_to: null,
      }),
    );

    if (requestingUser.role === Role.CITIZEN) {
      if (complaint.assigned_officer_id) {
        const officer = await this.usersRepository.findOne({
          where: { id: complaint.assigned_officer_id },
        });
        if (officer) {
          await this.notificationsService.create(
            officer.id,
            `${author?.name ?? 'The citizen'} commented on complaint #${complaint.tracking_code}.`,
            NotificationType.COMMENT_ADDED,
            complaint.id,
          );
          if (
            isNotificationPreferenceEnabled(
              officer.notification_preferences,
              'new-comments',
            )
          ) {
            await this.mailService.sendNewCommentEmail(
              officer.email,
              complaint.tracking_code,
              author?.name ?? 'The citizen',
            );
          }
        }
      }
    } else {
      await this.notificationsService.create(
        complaint.citizen_id,
        `${author?.name ?? 'An officer'} commented on your complaint #${complaint.tracking_code}.`,
        NotificationType.COMMENT_ADDED,
        complaint.id,
      );
      if (
        isNotificationPreferenceEnabled(
          complaint.citizen.notification_preferences,
          'new-comments',
        )
      ) {
        await this.mailService.sendNewCommentEmail(
          complaint.citizen.email,
          complaint.tracking_code,
          author?.name ?? 'An officer',
        );
      }
    }

    const updated = await this.loadFullComplaint(id);
    return this.toDetailDto(updated);
  }

  async assign(id: string, dto: AssignOfficerDto, requestingUser: AuthenticatedUser): Promise<ComplaintSummaryDto> {
    const complaint = await this.loadFullComplaint(id);

    if (complaint.status === ComplaintStatus.CLOSED || complaint.status === ComplaintStatus.REJECTED) {
      throw new BadRequestException('Cannot assign officers to a closed or rejected complaint');
    }

    if (dto.officer_id) {
      const officer = await this.usersRepository.findOne({
        where: { id: dto.officer_id },
      });

      if (!officer || officer.role !== Role.OFFICER) {
        throw new BadRequestException('Officer not found');
      }

      if (officer.department_id !== complaint.department_id) {
        throw new BadRequestException(
          'Officer does not belong to the complaint department',
        );
      }

      // No-op if already assigned to the same officer and no pending request
      if (complaint.assigned_officer_id === officer.id && !complaint.reassignment_requested) {
        return this.toSummaryDto(complaint);
      }

      const wasReassignmentRequest = complaint.reassignment_requested;

      complaint.assigned_officer_id = officer.id;
      complaint.assigned_officer = officer;  // keep relation in sync with FK
      // Clear any pending reassignment request
      complaint.reassignment_requested = false;
      complaint.reassignment_reason = null;
      await this.complaintsRepository.save(complaint);

      const commentText = wasReassignmentRequest
        ? `Admin approved reassignment request and assigned to ${officer.name}.`
        : `Assigned to ${officer.name}`;

      await this.complaintUpdatesRepository.save(
        this.complaintUpdatesRepository.create({
          complaint_id: complaint.id,
          author_id: requestingUser.id,
          comment: commentText,
          status_changed_to: null,
        }),
      );

      await this.notificationsService.create(
        officer.id,
        `Complaint #${complaint.tracking_code} has been assigned to you.`,
        NotificationType.REASSIGNED,
        complaint.id,
      );

      if (
        isNotificationPreferenceEnabled(
          officer.notification_preferences,
          'new-assignments',
        )
      ) {
        await this.mailService.sendAssignmentEmail(
          officer.email,
          complaint.tracking_code,
        );
      }
    } else {
      complaint.assigned_officer_id = null;
      await this.complaintsRepository.save(complaint);
    }

    const updated = await this.loadFullComplaint(id);
    return this.toSummaryDto(updated);
  }

  async requestReassignment(
    id: string,
    dto: RequestReassignmentDto,
    requestingUser: AuthenticatedUser,
  ): Promise<ComplaintDetailDto> {
    const complaint = await this.loadFullComplaint(id);

    if (complaint.status === ComplaintStatus.CLOSED || complaint.status === ComplaintStatus.REJECTED) {
      throw new BadRequestException('Cannot request reassignment on a closed or rejected complaint');
    }

    if (complaint.assigned_officer_id !== requestingUser.id) {
      throw new ForbiddenException('You can only request reassignment for complaints assigned to you');
    }

    if (complaint.reassignment_rejected) {
      throw new BadRequestException(
        'A reassignment request for this complaint was already rejected. No further requests are permitted.',
      );
    }

    if (complaint.reassignment_requested) {
      throw new BadRequestException(
        'A reassignment request is already pending admin review for this complaint.',
      );
    }

    const requester = await this.usersRepository.findOne({ where: { id: requestingUser.id } });
    const shortId = requestingUser.id.split('-')[0].toUpperCase();

    complaint.reassignment_requested = true;
    complaint.reassignment_reason = dto.reason;
    await this.complaintsRepository.save(complaint);

    await this.complaintUpdatesRepository.save(
      this.complaintUpdatesRepository.create({
        complaint_id: complaint.id,
        author_id: requestingUser.id,
        comment: `[REASSIGNMENT REQUEST] ${requester?.name ?? 'Officer'} (ID: ${shortId}) requested reassignment. Reason: ${dto.reason}`,
        status_changed_to: null,
      }),
    );

    // Notify all admins
    const admins = await this.usersRepository.find({ where: { role: Role.ADMIN } });
    for (const admin of admins) {
      await this.notificationsService.create(
        admin.id,
        `Officer ${requester?.name ?? 'Unknown'} requested reassignment of complaint #${complaint.tracking_code}. Reason: ${dto.reason}`,
        NotificationType.REASSIGNED,
        complaint.id,
      );
    }

    const updated = await this.loadFullComplaint(id);
    return this.toDetailDto(updated);
  }

  async rejectReassignment(
    id: string,
    requestingUser: AuthenticatedUser,
  ): Promise<ComplaintDetailDto> {
    const complaint = await this.loadFullComplaint(id);

    if (!complaint.reassignment_requested) {
      throw new BadRequestException('No pending reassignment request exists for this complaint');
    }

    complaint.reassignment_requested = false;
    complaint.reassignment_reason = null;
    complaint.reassignment_rejected = true;
    await this.complaintsRepository.save(complaint);

    await this.complaintUpdatesRepository.save(
      this.complaintUpdatesRepository.create({
        complaint_id: complaint.id,
        author_id: requestingUser.id,
        comment: 'Admin rejected the reassignment request. No further reassignment requests are permitted for this complaint.',
        status_changed_to: null,
      }),
    );

    // Notify the assigned officer
    if (complaint.assigned_officer_id) {
      await this.notificationsService.create(
        complaint.assigned_officer_id,
        `Your reassignment request for complaint #${complaint.tracking_code} was rejected by an admin.`,
        NotificationType.REASSIGNED,
        complaint.id,
      );
    }

    const updated = await this.loadFullComplaint(id);
    return this.toDetailDto(updated);
  }

  async remove(id: string): Promise<void> {
    const complaint = await this.complaintsRepository.findOne({
      where: { id },
      relations: { attachments: true },
    });

    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    for (const attachment of complaint.attachments ?? []) {
      await this.uploadService.deleteFromCloudinary(
        attachment.cloudinary_public_id,
      );
    }

    await this.complaintsRepository.remove(complaint);
  }

  private async pickOfficer(officers: User[], excludeComplaintId: string): Promise<User | null> {
    if (!officers.length) return null;

    const activeStatuses = [
      ComplaintStatus.SUBMITTED,
      ComplaintStatus.UNDER_REVIEW,
      ComplaintStatus.IN_PROGRESS,
    ];

    const counts = await Promise.all(
      officers.map(async (o) => {
        const count = await this.complaintsRepository.count({
          where: [
            ...activeStatuses.map((s) => ({
              assigned_officer_id: o.id,
              status: s,
            })),
          ],
        });
        return { officer: o, count };
      }),
    );

    const minCount = Math.min(...counts.map((c) => c.count));
    const candidates = counts.filter((c) => c.count === minCount).map((c) => c.officer);
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  private buildBaseQuery(): SelectQueryBuilder<Complaint> {
    return this.complaintsRepository
      .createQueryBuilder('complaint')
      .leftJoinAndSelect('complaint.citizen', 'citizen')
      .leftJoinAndSelect('complaint.department', 'department')
      .leftJoinAndSelect('complaint.category', 'category')
      .leftJoinAndSelect('complaint.assigned_officer', 'assigned_officer')
      .leftJoinAndSelect('complaint.attachments', 'attachments');
  }

  private applyFilters(
    qb: SelectQueryBuilder<Complaint>,
    query: ListComplaintsQueryDto,
  ): void {
    if (query.status) {
      qb.andWhere('complaint.status = :status', { status: query.status });
    }
    if (query.department_id) {
      qb.andWhere('complaint.department_id = :departmentId', {
        departmentId: query.department_id,
      });
    }
    if (query.category_id) {
      qb.andWhere('complaint.category_id = :categoryId', {
        categoryId: query.category_id,
      });
    }
    if (query.assigned_officer_id) {
      qb.andWhere('complaint.assigned_officer_id = :officerId', {
        officerId: query.assigned_officer_id,
      });
    }
    if (query.citizen_id) {
      qb.andWhere('complaint.citizen_id = :citizenId', {
        citizenId: query.citizen_id,
      });
    }
    if (query.search) {
      qb.andWhere(
        '(complaint.title ILIKE :search OR complaint.tracking_code ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }
  }

  private async loadFullComplaint(id: string): Promise<Complaint> {
    const complaint = await this.complaintsRepository.findOne({
      where: { id },
      relations: {
        citizen: true,
        department: true,
        category: true,
        assigned_officer: true,
        attachments: true,
        updates: { author: true },
      },
    });

    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    return complaint;
  }

  private assertCanView(
    complaint: Complaint,
    requestingUser: AuthenticatedUser,
  ): void {
    if (requestingUser.role === Role.ADMIN) {
      return;
    }
    if (requestingUser.role === Role.CITIZEN) {
      if (complaint.citizen_id !== requestingUser.id) {
        throw new ForbiddenException('You cannot view this complaint');
      }
      return;
    }
    if (requestingUser.role === Role.OFFICER) {
      if (complaint.assigned_officer_id !== requestingUser.id) {
        throw new ForbiddenException('You cannot view this complaint');
      }
      return;
    }
  }

  private assertCanTransition(
    complaint: Complaint,
    newStatus: ComplaintStatus,
    requestingUser: AuthenticatedUser,
  ): void {
    if (requestingUser.role === Role.ADMIN) {
      return;
    }

    if (requestingUser.role === Role.CITIZEN) {
      if (
        complaint.citizen_id === requestingUser.id &&
        complaint.status === ComplaintStatus.RESOLVED &&
        newStatus === ComplaintStatus.CLOSED
      ) {
        return;
      }
      throw new ForbiddenException('You cannot perform this status change');
    }

    if (requestingUser.role === Role.OFFICER) {
      if (complaint.assigned_officer_id !== requestingUser.id) {
        throw new ForbiddenException(
          'You cannot update complaints not assigned to you',
        );
      }

      if (complaint.reassignment_requested) {
        throw new ForbiddenException(
          'This complaint is frozen pending admin review of your reassignment request. You cannot change its status until the request is resolved.',
        );
      }

      const allowed = ALLOWED_TRANSITIONS[complaint.status] ?? [];
      if (!allowed.includes(newStatus)) {
        throw new BadRequestException(
          `Cannot transition complaint from ${complaint.status} to ${newStatus}`,
        );
      }
      return;
    }

    throw new ForbiddenException('You cannot perform this status change');
  }

  private toSummaryDto(complaint: Complaint): ComplaintSummaryDto {
    return {
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
    };
  }

  private toDetailDto(complaint: Complaint): ComplaintDetailDto {
    const updates = (complaint.updates ?? []).sort(
      (a, b) => a.created_at.getTime() - b.created_at.getTime(),
    );

    return {
      id: complaint.id,
      tracking_code: complaint.tracking_code,
      title: complaint.title,
      description: complaint.description,
      location: complaint.location,
      latitude: complaint.latitude,
      longitude: complaint.longitude,
      status: complaint.status,
      citizen: {
        id: complaint.citizen.id,
        name: complaint.citizen.name,
        email: complaint.citizen.email,
      },
      department: {
        id: complaint.department.id,
        name: complaint.department.name,
      },
      category: {
        id: complaint.category.id,
        name: complaint.category.name,
      },
      assigned_officer: complaint.assigned_officer
        ? {
            id: complaint.assigned_officer.id,
            name: complaint.assigned_officer.name,
          }
        : null,
      attachments: (complaint.attachments ?? []).map((attachment) => ({
        id: attachment.id,
        file_url: attachment.file_url,
        file_name: attachment.file_name,
        mime_type: attachment.mime_type,
      })),
      updates: updates.map((update) => ({
        id: update.id,
        comment: update.comment,
        status_changed_to: update.status_changed_to,
        author: {
          id: update.author.id,
          name: update.author.name,
          role: update.author.role,
        },
        created_at: update.created_at,
      })),
      created_at: complaint.created_at,
      updated_at: complaint.updated_at,
      resolved_at: complaint.resolved_at,
      reassignment_requested: complaint.reassignment_requested ?? false,
      reassignment_reason: complaint.reassignment_reason ?? null,
      reassignment_rejected: complaint.reassignment_rejected ?? false,
    };
  }
}
