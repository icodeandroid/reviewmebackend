import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/jwt-payload.interface';
import { QueryNotificationDto } from './dto/notification.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('10. Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List my notifications' })
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: QueryNotificationDto) {
    return this.notificationsService.findAllForUser(user.id, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Number of unread notifications (for the bell badge)' })
  unreadCount(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.unreadCount(user.id);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark every notification as read' })
  markAllAsRead(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a single notification as read' })
  markAsRead(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Delete all my notifications' })
  clearAll(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.clearAll(user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    await this.notificationsService.remove(id, user.id);
    return { message: 'Notification deleted' };
  }
}
