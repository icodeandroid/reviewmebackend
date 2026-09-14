import { Injectable } from '@nestjs/common';
import { SentimentLabel } from '../../common/enums';
import { ReviewsProvider } from './reviews.provider';

@Injectable()
export class ReviewAnalyticsProvider {
  constructor(private readonly reviewsProvider: ReviewsProvider) {}

  async getStatistics() {
    const reviews = await this.reviewsProvider.findAll();
    const total = reviews.length;
    const positive = reviews.filter(r => r.sentiment === SentimentLabel.POSITIVE).length;
    const negative = reviews.filter(r => r.sentiment === SentimentLabel.NEGATIVE).length;
    const neutral = reviews.filter(r => r.sentiment === SentimentLabel.NEUTRAL).length;
    return { total, positive, negative, neutral };
  }
}