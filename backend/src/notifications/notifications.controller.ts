import { Controller, Get, Patch, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/clerk.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';
import { PushSubscriptionDto } from './dto/push-subscription.dto';

@Controller('notifications')
@UseGuards(ClerkAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getMyNotifications(@CurrentUser() user: { id: string }) {
    return this.notificationsService.getMyNotifications(user.id);
  }

  @Patch('read-all')
  markAllRead(@CurrentUser() user: { id: string }) {
    return this.notificationsService.markAllRead(user.id);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.notificationsService.markRead(id, user.id);
  }

  @Post('subscribe')
  subscribe(@CurrentUser() user: { id: string }, @Body() dto: PushSubscriptionDto) {
    return this.notificationsService.subscribe(user.id, dto);
  }

  @Delete('subscribe')
  unsubscribe(@CurrentUser() user: { id: string }, @Body('endpoint') endpoint: string) {
    return this.notificationsService.unsubscribe(user.id, endpoint);
  }
}
