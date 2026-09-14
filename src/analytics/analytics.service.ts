import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { BusinessesService } from '../businesses/businesses.service';
import { ReviewStatus, SentimentLabel } from '../common/enums';
import { AuthenticatedUser } from '../common/interfaces/jwt-payload.interface';
import { Review } from '../reviews/entities/review.entity';
import { SentimentResult } from '../reviews/entities/sentiment-result.entity';
import { AnalyticsQueryDto } from './dto/analytics.dto';

/**
 * Reporting layer for the Analytics screen: trends over time, sentiment and
 * rating distributions, keyword extraction and CSV export.
 */
@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(SentimentResult)
    private readonly sentimentRepository: Repository<SentimentResult>,
    private readonly businessesService: BusinessesService,
  ) {}

  async summary(query: AnalyticsQueryDto, user: AuthenticatedUser) {
    const { reviews, range } = await this.load(query, user);
    const approved = reviews.filter((r) => r.status === ReviewStatus.APPROVED);
    const analysed = reviews.filter((r) => r.sentiment);

    const scores = analysed.map((r) => r.sentimentScore ?? 0);
    const positives = analysed.filter((r) => r.sentiment === SentimentLabel.POSITIVE).length;

    return {
      range,
      totalReviews: reviews.length,
      approvedReviews: approved.length,
      averageRating: this.average(reviews.map((r) => r.rating)),
      averageSentimentScore: this.average(scores, 3),
      positiveRate: analysed.length
        ? Number(((positives / analysed.length) * 100).toFixed(1))
        : 0,
      responseRate: {
        analysed: analysed.length,
        awaitingAnalysis: reviews.length - analysed.length,
      },
      npsStyleScore: this.npsStyle(reviews),
    };
  }

  async sentimentDistribution(query: AnalyticsQueryDto, user: AuthenticatedUser) {
    const { reviews, range } = await this.load(query, user);

    const counts = {
      POSITIVE: reviews.filter((r) => r.sentiment === SentimentLabel.POSITIVE).length,
      NEUTRAL: reviews.filter((r) => r.sentiment === SentimentLabel.NEUTRAL).length,
      NEGATIVE: reviews.filter((r) => r.sentiment === SentimentLabel.NEGATIVE).length,
    };
    const total = counts.POSITIVE + counts.NEUTRAL + counts.NEGATIVE;

    return {
      range,
      total,
      counts,
      percentages: {
        POSITIVE: this.percent(counts.POSITIVE, total),
        NEUTRAL: this.percent(counts.NEUTRAL, total),
        NEGATIVE: this.percent(counts.NEGATIVE, total),
      },
    };
  }

  async ratingDistribution(query: AnalyticsQueryDto, user: AuthenticatedUser) {
    const { reviews, range } = await this.load(query, user);

    const distribution = [5, 4, 3, 2, 1].map((star) => {
      const count = reviews.filter((r) => r.rating === star).length;
      return { rating: star, count, percentage: this.percent(count, reviews.length) };
    });

    return {
      range,
      total: reviews.length,
      averageRating: this.average(reviews.map((r) => r.rating)),
      distribution,
    };
  }

  /** Reviews and average rating bucketed by day, week or month. */
  async timeSeries(query: AnalyticsQueryDto, user: AuthenticatedUser) {
    const { reviews, range } = await this.load(query, user);
    const interval = query.interval ?? 'day';

    const buckets = new Map<
      string,
      { reviews: number; ratingSum: number; positive: number; neutral: number; negative: number }
    >();

    for (const review of reviews) {
      const key = this.bucketKey(new Date(review.createdAt), interval);
      const bucket =
        buckets.get(key) ??
        { reviews: 0, ratingSum: 0, positive: 0, neutral: 0, negative: 0 };

      bucket.reviews += 1;
      bucket.ratingSum += review.rating;
      if (review.sentiment === SentimentLabel.POSITIVE) bucket.positive += 1;
      else if (review.sentiment === SentimentLabel.NEGATIVE) bucket.negative += 1;
      else if (review.sentiment === SentimentLabel.NEUTRAL) bucket.neutral += 1;

      buckets.set(key, bucket);
    }

    const points = [...buckets.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([period, bucket]) => ({
        period,
        reviews: bucket.reviews,
        averageRating: Number((bucket.ratingSum / bucket.reviews).toFixed(2)),
        positive: bucket.positive,
        neutral: bucket.neutral,
        negative: bucket.negative,
      }));

    return { range, interval, points };
  }

  /** Most frequent keywords, split by the sentiment of the review they came from. */
  async keywords(query: AnalyticsQueryDto, user: AuthenticatedUser, limit = 20) {
    const { reviews, range } = await this.load(query, user);
    const reviewIds = reviews.map((r) => r.id);

    if (!reviewIds.length) return { range, keywords: [] };

    const results = await this.sentimentRepository.find({
      where: { reviewId: In(reviewIds) },
    });

    const sentimentByReview = new Map(reviews.map((r) => [r.id, r.sentiment]));
    const tally = new Map<string, { count: number; positive: number; negative: number }>();

    for (const result of results) {
      for (const keyword of result.keywords ?? []) {
        const entry = tally.get(keyword) ?? { count: 0, positive: 0, negative: 0 };
        entry.count += 1;

        const sentiment = sentimentByReview.get(result.reviewId);
        if (sentiment === SentimentLabel.POSITIVE) entry.positive += 1;
        if (sentiment === SentimentLabel.NEGATIVE) entry.negative += 1;

        tally.set(keyword, entry);
      }
    }

    const keywords = [...tally.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, limit)
      .map(([word, entry]) => ({
        keyword: word,
        mentions: entry.count,
        positiveMentions: entry.positive,
        negativeMentions: entry.negative,
      }));

    return { range, keywords };
  }

  /** CSV export of the filtered reviews, for the report section of the FYP. */
  async exportCsv(query: AnalyticsQueryDto, user: AuthenticatedUser): Promise<string> {
    const { reviews } = await this.load(query, user);

    const header = [
      'Review ID', 'Date', 'Customer', 'Rating', 'Type', 'Status',
      'Sentiment', 'Sentiment Score', 'Content',
    ];

    const rows = reviews.map((review) => [
      review.id,
      new Date(review.createdAt).toISOString(),
      review.customerName,
      review.rating,
      review.type,
      review.status,
      review.sentiment ?? '',
      review.sentimentScore ?? '',
      (review.content || review.transcript || '').replace(/\s+/g, ' '),
    ]);

    return [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
  }

  // ---------------------------------------------------------------- helpers

  private async load(query: AnalyticsQueryDto, user: AuthenticatedUser) {
    let businessIds: string[];

    if (query.businessId) {
      const business = await this.businessesService.findById(query.businessId);
      this.businessesService.assertOwnership(business, user);
      businessIds = [business.id];
    } else {
      businessIds = await this.businessesService.resolveAccessibleBusinessIds(user);
    }

    const to = query.to ? new Date(query.to) : new Date();
    to.setHours(23, 59, 59, 999);

    const from = query.from
      ? new Date(query.from)
      : new Date(to.getTime() - 90 * 24 * 60 * 60 * 1000);
    from.setHours(0, 0, 0, 0);

    const range = { from: from.toISOString(), to: to.toISOString() };

    if (!businessIds.length) return { reviews: [] as Review[], range };

    const reviews = await this.reviewRepository.find({
      where: { businessId: In(businessIds), createdAt: Between(from, to) },
      order: { createdAt: 'ASC' },
    });

    return { reviews, range };
  }

  private bucketKey(date: Date, interval: 'day' | 'week' | 'month'): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    if (interval === 'month') return `${year}-${month}`;

    if (interval === 'week') {
      // ISO-style week number.
      const temp = new Date(Date.UTC(year, date.getMonth(), date.getDate()));
      const dayNumber = temp.getUTCDay() || 7;
      temp.setUTCDate(temp.getUTCDate() + 4 - dayNumber);
      const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
      const week = Math.ceil(((temp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
      return `${temp.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
    }

    return `${year}-${month}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private average(values: number[], decimals = 2): number {
    const clean = values.filter((v) => typeof v === 'number' && !Number.isNaN(v));
    if (!clean.length) return 0;
    return Number((clean.reduce((sum, v) => sum + v, 0) / clean.length).toFixed(decimals));
  }

  private percent(part: number, total: number): number {
    if (!total) return 0;
    return Number(((part / total) * 100).toFixed(1));
  }

  /** Promoters (5★) minus detractors (1–2★) as a percentage. */
  private npsStyle(reviews: Review[]): number {
    if (!reviews.length) return 0;
    const promoters = reviews.filter((r) => r.rating === 5).length;
    const detractors = reviews.filter((r) => r.rating <= 2).length;
    return Number((((promoters - detractors) / reviews.length) * 100).toFixed(1));
  }
}
