import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/entities/user.entity';
import { Business } from '../businesses/entities/business.entity';
import { Review } from '../reviews/entities/review.entity';
import { MediaFile } from '../media/entities/media-file.entity';
import { Widget } from '../widgets/entities/widget.entity';
import { Notification } from '../notifications/entities/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'reviewme',
      entities: [
        User,
        Business,
        Review,
        MediaFile,
        Widget,
        Notification,
      ],
      synchronize: false,
    }),
  ],
})
export class DatabaseModule {}