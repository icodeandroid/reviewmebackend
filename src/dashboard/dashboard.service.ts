import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BusinessesService } from '../businesses/businesses.service';
import { Business } from '../businesses/entities/business.entity';
import { AiStatus, ReviewStatus, ReviewType, SentimentLabel, UserRole } from '../common/enums';
import { AuthenticatedUser } from '../common/interfaces/jwt-payload.interface';
import { Review } from '../reviews/entities/review.entity';
import { User } from '../users/entities/user.entity';

/**
 * TC-09 — Dashboard.
 * Aggregates the headline numbers a business owner sees after logging in.
 */
@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly businessesService: BusinessesService,
  ) {}

  async overview(user: AuthenticatedUser, businessId?: string) {
    const businessIds = await this.resolveScope(user, businessId);

    if (!businessIds.length) {
      return this.emptyOverview();
    }

    const reviews = await this.reviewRepository.find({
      where: { businessId: In(businessIds) },
      order: { createdAt: 'DESC' },
    });

    const approved = reviews.filter((r) => r.status === ReviewStatus.APPROVED);
    const ratings = approved.map((r) => r.rating);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonth = reviews.filter((r) => new Date(r.createdAt) >= startOfMonth);
    const prevMonth = reviews.filter((r) => {
      const created = new Date(r.createdAt);
      return created >= startOfPrevMonth && created < startOfMonth;
    });

    return {
      businessCount: businessIds.length,
      totals: {
        allReviews: reviews.length,
        pending: reviews.filter((r) => r.status === ReviewStatus.PENDING).length,
        approved: approved.length,
        rejected: reviews.filter((r) => r.status === ReviewStatus.REJECTED).length,
      },
      averageRating: this.average(ratings),
      ratingBreakdown: this.ratingBreakdown(approved),
      sentimentBreakdown: this.sentimentBreakdown(approved),
      reviewTypes: {
        TEXT: reviews.filter((r) => r.type === ReviewType.TEXT).length,
        AUDIO: reviews.filter((r) => r.type === ReviewType.AUDIO).length,
        VIDEO: reviews.filter((r) => r.type === ReviewType.VIDEO).length,
      },
      aiPipeline: {
        pending: reviews.filter((r) => r.aiStatus === AiStatus.PENDING).length,
        processing: reviews.filter((r) => r.aiStatus === AiStatus.PROCESSING).length,
        completed: reviews.filter((r) => r.aiStatus === AiStatus.COMPLETED).length,
        failed: reviews.filter((r) => r.aiStatus === AiStatus.FAILED).length,
      },
      thisMonth: {
        reviews: thisMonth.length,
        averageRating: this.average(thisMonth.map((r) => r.rating)),
        changeVsLastMonth: this.percentChange(prevMonth.length, thisMonth.length),
      },
      generatedAt: new Date().toISOString(),
    };
  }

  async recentReviews(user: AuthenticatedUser, limit = 5, businessId?: string) {
    const businessIds = await this.resolveScope(user, businessId);
    if (!businessIds.length) return [];

    const reviews = await this.reviewRepository.find({
      where: { businessId: In(businessIds) },
      relations: { business: true },
      order: { createdAt: 'DESC' },
      take: Math.min(limit, 50),
    });

    return reviews.map((review) => ({
      id: review.id,
      businessName: review.business?.name,
      customerName: review.customerName,
      rating: review.rating,
      type: review.type,
      status: review.status,
      sentiment: review.sentiment,
      excerpt: (review.content || review.transcript || '').slice(0, 160),
      createdAt: review.createdAt,
    }));
  }

  /** System-wide figures for the admin dashboard. */
  async adminOverview() {
    const [users, businesses, reviews] = await Promise.all([
      this.userRepository.count(),
      this.businessRepository.count(),
      this.reviewRepository.find(),
    ]);

    const [admins, businessUsers, customers] = await Promise.all([
      this.userRepository.count({ where: { role: UserRole.ADMIN } }),
      this.userRepository.count({ where: { role: UserRole.BUSINESS } }),
      this.userRepository.count({ where: { role: UserRole.CUSTOMER } }),
    ]);

    return {
      users: { total: users, admins, businessUsers, customers },
      businesses: { total: businesses },
      reviews: {
        total: reviews.length,
        pending: reviews.filter((r) => r.status === ReviewStatus.PENDING).length,
        approved: reviews.filter((r) => r.status === ReviewStatus.APPROVED).length,
        rejected: reviews.filter((r) => r.status === ReviewStatus.REJECTED).length,
        averageRating: this.average(reviews.map((r) => r.rating)),
      },
      sentimentBreakdown: this.sentimentBreakdown(reviews),
      generatedAt: new Date().toISOString(),
    };
  }

  // ---------------------------------------------------------------- helpers

  private async resolveScope(user: AuthenticatedUser, businessId?: string): Promise<string[]> {
    if (businessId) {
      const business = await this.businessesService.findById(businessId);
      this.businessesService.assertOwnership(business, user);
      return [business.id];
    }
    return this.businessesService.resolveAccessibleBusinessIds(user);
  }

  private average(values: number[]): number {
    if (!values.length) return 0;
    return Number((values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(2));
  }

  private ratingBreakdown(reviews: Review[]): Record<string, number> {
    return [1, 2, 3, 4, 5].reduce(
      (acc, star) => ({ ...acc, [star]: reviews.filter((r) => r.rating === star).length }),
      {},
    );
  }

  private sentimentBreakdown(reviews: Review[]) {
    const positive = reviews.filter((r) => r.sentiment === SentimentLabel.POSITIVE).length;
    const neutral = reviews.filter((r) => r.sentiment === SentimentLabel.NEUTRAL).length;
    const negative = reviews.filter((r) => r.sentiment === SentimentLabel.NEGATIVE).length;
    const analysed = positive + neutral + negative;

    return {
      positive,
      neutral,
      negative,
      unanalysed: reviews.length - analysed,
      positivePercent: analysed ? Number(((positive / analysed) * 100).toFixed(1)) : 0,
      negativePercent: analysed ? Number(((negative / analysed) * 100).toFixed(1)) : 0,
    };
  }

  private percentChange(previous: number, current: number): number {
    if (previous === 0) return current === 0 ? 0 : 100;
    return Number((((current - previous) / previous) * 100).toFixed(1));
  }

  private emptyOverview() {
    return {
      businessCount: 0,
      totals: { allReviews: 0, pending: 0, approved: 0, rejected: 0 },
      averageRating: 0,
      ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      sentimentBreakdown: {
        positive: 0, neutral: 0, negative: 0, unanalysed: 0,
        positivePercent: 0, negativePercent: 0,
      },
      reviewTypes: { TEXT: 0, AUDIO: 0, VIDEO: 0 },
      aiPipeline: { pending: 0, processing: 0, completed: 0, failed: 0 },
      thisMonth: { reviews: 0, averageRating: 0, changeVsLastMonth: 0 },
      message: 'No businesses registered yet. Create one to start collecting reviews.',
      generatedAt: new Date().toISOString(),
    };
  }
}
