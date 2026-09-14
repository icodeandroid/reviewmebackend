import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationType, ReviewStatus, SentimentLabel } from '../common/enums';
import { NotificationsService } from './notifications.service';

export interface ReviewCreatedEvent {
  reviewId: string;
  businessId: string;
  businessName: string;
  ownerId: string;
  customerName: string;
  rating: number;
  type: string;
}

export interface ReviewProcessedEvent {
  reviewId: string;
  businessName: string;
  ownerId: string;
  sentiment: SentimentLabel;
  score: number;
}

export interface ReviewModeratedEvent {
  reviewId: string;
  businessName: string;
  customerId?: string;
  status: ReviewStatus;
}


@Injectable()
export class NotificationsListener {
  private readonly logger = new Logger(NotificationsListener.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  /** TC-11: a new review must notify the business owner. */
  @OnEvent('review.created')
  async handleReviewCreated(event: ReviewCreatedEvent) {
    await this.notificationsService.create({
      userId: event.ownerId,
      title: 'New review received',
      message: `${event.customerName} left a ${event.rating}-star ${event.type.toLowerCase()} review for ${event.businessName}.`,
      type: NotificationType.REVIEW_SUBMITTED,
      metadata: { reviewId: event.reviewId, businessId: event.businessId },
    });
  }

  @OnEvent('review.processed')
  async handleReviewProcessed(event: ReviewProcessedEvent) {
    await this.notificationsService.create({
      userId: event.ownerId,
      title: 'AI analysis complete',
      message: `A review for ${event.businessName} was analysed as ${event.sentiment} (score ${event.score.toFixed(2)}).`,
      type: NotificationType.AI_COMPLETED,
      metadata: { reviewId: event.reviewId, sentiment: event.sentiment },
    });
  }

  @OnEvent('review.failed')
  async handleReviewFailed(event: { reviewId: string; ownerId: string; error: string }) {
    await this.notificationsService.create({
      userId: event.ownerId,
      title: 'AI processing failed',
      message: `A review could not be processed automatically: ${event.error}`,
      type: NotificationType.AI_FAILED,
      metadata: { reviewId: event.reviewId },
    });
  }


  @OnEvent('review.moderated')
  async handleReviewModerated(event: ReviewModeratedEvent) {
    if (!event.customerId) return;

    const approved = event.status === ReviewStatus.APPROVED;
    await this.notificationsService.create({
      userId: event.customerId,
      title: approved ? 'Your review is live' : 'Your review was not published',
      message: approved
        ? `Your review for ${event.businessName} has been approved and is now visible publicly.`
        : `Your review for ${event.businessName} was rejected by the business owner.`,
      type: approved ? NotificationType.REVIEW_APPROVED : NotificationType.REVIEW_REJECTED,
      metadata: { reviewId: event.reviewId },
    });
  }
}
