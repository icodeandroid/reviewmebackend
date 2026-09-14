import { Injectable, NotFoundException } from '@nestjs/common';
import { ReviewStatus, SentimentLabel } from '../common/enums';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsProvider } from './providers/reviews.provider';
import { ReviewModerationProvider } from './providers/review-moderation.provider';
import { ReviewAnalyticsProvider } from './providers/review-analytics.provider';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewsProvider: ReviewsProvider,
    private readonly moderationProvider: ReviewModerationProvider,
    private readonly analyticsProvider: ReviewAnalyticsProvider,
    private readonly aiService: AiService,
  ) {}

  async create(dto: CreateReviewDto): Promise<Review> {
    let sentiment: SentimentLabel | undefined;
    let confidenceScore: number | undefined;
    let transcript: string | undefined;

    const textToAnalyze = (dto as any).content || (dto as any).reviewText || (dto as any).text;

    if (textToAnalyze) {
      try {
        const aiResult = await this.aiService.processReview({ text: textToAnalyze });
        sentiment = aiResult.sentiment as SentimentLabel;
        confidenceScore = aiResult.confidenceScore;
        transcript = aiResult.transcript;
      } catch {
      
      }
    }

    return this.reviewsProvider.create({ ...dto, sentiment, confidenceScore, transcript } as any) as unknown as Promise<Review>; }

  async findAll(): Promise<Review[]> {
    return this.reviewsProvider.findAll();
  }

  async findPublic(businessId: string): Promise<Review[]> {
    return this.reviewsProvider.findPublic(businessId);
  }


  async updateStatus(id: string, status: ReviewStatus) {
    const review = await this.reviewsProvider.findById(id);
    if (!review) throw new NotFoundException('Review not found');
    review.status = status;
    return this.reviewsProvider.save(review);
  }

  async remove(id: string) {
    return this.reviewsProvider.delete(id);
  }

  async approve(id: string) {
    return this.moderationProvider.approveReview(id);
  }

  async analytics() {
    return this.analyticsProvider.getStatistics();
  }
  
}