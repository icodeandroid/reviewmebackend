import { Injectable, NotFoundException } from '@nestjs/common';
import { ReviewStatus } from '../../common/enums';
import { ReviewsProvider } from './reviews.provider';

@Injectable()
export class ReviewModerationProvider {
  constructor(private readonly reviewsProvider: ReviewsProvider) {}

  async approveReview(id: string) {
    const review = await this.reviewsProvider.findById(id);
    if (!review) throw new NotFoundException('Review not found');
    review.status = ReviewStatus.APPROVED;
    return this.reviewsProvider.save(review);
  }

  async rejectReview(id: string) {
    const review = await this.reviewsProvider.findById(id);
    if (!review) throw new NotFoundException('Review not found');
    review.status = ReviewStatus.REJECTED;
    return this.reviewsProvider.save(review);
  }
}