import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsHexColor,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';
import { WidgetLayout, WidgetTheme } from '../../common/enums';

export class CreateWidgetDto {
  @IsUUID()
  businessId: string;

  @IsString()
  @Length(2, 120)
  name: string;

  @IsOptional()
  @IsEnum(WidgetTheme)
  theme?: WidgetTheme;

  @IsOptional()
  @IsEnum(WidgetLayout)
  layout?: WidgetLayout;

  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  minRating?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  maxReviews?: number;

  @IsOptional()
  @IsBoolean()
  showSentiment?: boolean;

  @IsOptional()
  @IsBoolean()
  showRating?: boolean;

  @IsOptional()
  @IsBoolean()
  showAverage?: boolean;
}

export class UpdateWidgetDto extends PartialType(CreateWidgetDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
