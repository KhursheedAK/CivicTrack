import { ApiProperty } from '@nestjs/swagger';
import { NotificationItemDto } from './notification-item.dto';

export class PaginatedNotificationsDto {
  @ApiProperty({ type: [NotificationItemDto] })
  items: NotificationItemDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  unread_count: number;
}
