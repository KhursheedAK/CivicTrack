import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationType } from '../common/enums/notification-type.enum';
import { ListNotificationsQueryDto } from './dto/list-notifications-query.dto';
import { PaginatedNotificationsDto } from './dto/paginated-notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
  ) {}

  async create(
    userId: string,
    message: string,
    type: NotificationType,
    referenceId: string | null,
  ): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      user_id: userId,
      message,
      type,
      reference_id: referenceId,
    });
    return this.notificationsRepository.save(notification);
  }

  async findForUser(
    userId: string,
    query: ListNotificationsQueryDto,
  ): Promise<PaginatedNotificationsDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.notificationsRepository
      .createQueryBuilder('notification')
      .where('notification.user_id = :userId', { userId })
      .orderBy('notification.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.unread) {
      qb.andWhere('notification.is_read = false');
    }

    const [items, total] = await qb.getManyAndCount();

    const unreadCount = await this.notificationsRepository.count({
      where: { user_id: userId, is_read: false },
    });

    return { items, total, unread_count: unreadCount };
  }

  async markAsRead(userId: string, id: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    if (notification.user_id !== userId) {
      throw new ForbiddenException('You cannot modify this notification');
    }
    notification.is_read = true;
    return this.notificationsRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.notificationsRepository.update(
      { user_id: userId, is_read: false },
      { is_read: true },
    );
    return result.affected ?? 0;
  }
}
