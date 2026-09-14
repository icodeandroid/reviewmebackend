import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { buildPaginatedResult } from '../common/dto/pagination.dto';
import { NotificationType } from '../common/enums';
import { CreateNotificationDto, QueryNotificationDto } from './dto/notification.dto';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

 
  async create(dto: CreateNotificationDto): Promise<Notification | null> {
    try {
      const notification = this.notificationRepository.create({
  userId: dto.userId,
  title: dto.title,
  message: dto.message,
  type: dto.type ?? NotificationType.SYSTEM,
  metadata: dto.metadata ?? undefined,
} as any);
return await this.notificationRepository.save(notification) as unknown as Notification;
      
    } catch (error: any) {
      this.logger.error(`Failed to create notification: ${error.message}`);
      return null;
    }
  }

  async findAllForUser(userId: string, query: QueryNotificationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const where: any = { userId };
    if (query.unreadOnly) where.isRead = false;
    if (query.type) where.type = query.type;

    const [items, total] = await this.notificationRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return buildPaginatedResult(items, total, page, limit);
  }

  async unreadCount(userId: string): Promise<{ unread: number }> {
    const unread = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });
    return { unread };
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({ where: { id, userId } });
    if (!notification) throw new NotFoundException('Notification not found');

    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<{ updated: number }> {
    const result = await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
    return { updated: result.affected ?? 0 };
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.notificationRepository.delete({ id, userId });
    if (!result.affected) throw new NotFoundException('Notification not found');
  }

  async clearAll(userId: string): Promise<{ deleted: number }> {
    const result = await this.notificationRepository.delete({ userId });
    return { deleted: result.affected ?? 0 };
  }
}
