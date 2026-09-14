import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { ReviewType } from '../../common/enums';

export class CreateReviewDto {
  @IsUUID('4', { message: 'businessId must be a valid business identifier' })
  businessId!: string;

  @IsString()
  @Length(2, 120)
  customerName!: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Rating must be between 1 and 5' })
  @Max(5, { message: 'Rating must be between 1 and 5' })
  rating!: number;

  @IsOptional()
  @IsEnum(ReviewType)
  type?: ReviewType = ReviewType.TEXT;

  /** Required for TEXT reviews; optional caption for audio/video reviews. */
  @ValidateIf((dto: CreateReviewDto) => !dto.type || dto.type === ReviewType.TEXT)
  @IsString({ message: 'A text review must include content' })
  @Length(3, 5000)
  content?: string;

  /** Ids returned by POST /media/upload. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsUUID('4', { each: true })
  mediaIds?: string[];
}

export class ManualTranscriptDto {
  @IsString()
  @MaxLength(10000)
  transcript!: string;
}