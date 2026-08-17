import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../../common/enums/notification-type.enum';

export class NotificationItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ enum: NotificationType })
  type: NotificationType;

  @ApiProperty({ nullable: true })
  reference_id: string | null;

  @ApiProperty()
  is_read: boolean;

  @ApiProperty()
  created_at: Date;
}
