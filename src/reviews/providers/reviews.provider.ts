import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { ReviewStatus } from '../../common/enums';

@Injectable()
export class ReviewsProvider {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

 async create(review: Partial<Review>): Promise<Review> {
  const entity = this.reviewRepository.create(review as any);
  const saved = await this.reviewRepository.save(entity);
  return saved as unknown as Review;
}

  async findAll() {
    return this.reviewRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string) {
    return this.reviewRepository.findOne({ where: { id } });
  }

  async findPublic(businessId: string) {
    return this.reviewRepository.find({
      where: { businessId, status: ReviewStatus.APPROVED },
    });
  }

  async save(review: Review) {
    return this.reviewRepository.save(review);
  }

  async delete(id: string) {
    return this.reviewRepository.delete(id);
  }
}