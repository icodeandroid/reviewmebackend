import { IsEnum } from 'class-validator';
import { ReviewStatus } from '../../common/enums';

export class UpdateReviewStatusDto {
  @IsEnum(ReviewStatus)
  status!: ReviewStatus;
}