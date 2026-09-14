import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ReviewStatus, ReviewType, SentimentLabel } from '../../common/enums';

export class QueryReviewDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  businessId?: string;

  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus;

  @IsOptional()
  @IsEnum(ReviewType)
  type?: ReviewType;

  @IsOptional()
  @IsEnum(SentimentLabel)
  sentiment?: SentimentLabel;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'rating' | 'sentimentScore' = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class ModerateReviewDto {
  @IsOptional()
  @IsString()
  note?: string;
}
