import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class AnalyticsQueryDto {
  /** Restrict the report to one business. Defaults to every business I own. */
  @IsOptional()
  @IsUUID()
  businessId?: string;

  /** ISO date, e.g. 2026-01-01. Defaults to 90 days ago. */
  @IsOptional()
  @IsDateString()
  from?: string;

  /** ISO date. Defaults to today. */
  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsIn(['day', 'week', 'month'])
  interval?: 'day' | 'week' | 'month' = 'day';

  /** Used by the keywords endpoint. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
