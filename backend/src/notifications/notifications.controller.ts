import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { NotificationsService } from './notifications.service';
import { ListNotificationsQueryDto } from './dto/list-notifications-query.dto';
import { PaginatedNotificationsDto } from './dto/paginated-notifications.dto';
import { Notification } from './entities/notification.entity';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: "Get the current user's notifications" })
  findMine(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListNotificationsQueryDto,
  ): Promise<PaginatedNotificationsDto> {
    return this.notificationsService.findForUser(user.id, query);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ updated_count: number }> {
    const updated_count = await this.notificationsService.markAllAsRead(user.id);
    return { updated_count };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  markAsRead(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Notification> {
    return this.notificationsService.markAsRead(user.id, id);
  }
}
