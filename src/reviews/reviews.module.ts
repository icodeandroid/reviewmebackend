import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Review } from './entities/review.entity';

import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { SentimentResult } from './entities/sentiment-result.entity';
import { ReviewsProvider } from './providers/reviews.provider';

import { ReviewModerationProvider } from './providers/review-moderation.provider';

import { ReviewAnalyticsProvider } from './providers/review-analytics.provider';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
     TypeOrmModule.forFeature([Review, SentimentResult]),
    AiModule,
  ],
  controllers: [
    ReviewsController,
  ],
  providers: [
    ReviewsService,
    ReviewsProvider,
    ReviewModerationProvider,
    ReviewAnalyticsProvider,
  ],
  exports: [
    ReviewsService,
    ReviewsProvider,
    ReviewModerationProvider,
    ReviewAnalyticsProvider,
  ],
})
export class ReviewsModule {}