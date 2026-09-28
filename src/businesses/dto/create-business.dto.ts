import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

const parseJson = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

export class CreateBusinessDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  foundedYear?: number;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  brandColor?: string;

  @IsOptional()
  @Transform(parseJson)
  @IsObject()
  businessHours?: Record<string, string>;

  @IsOptional()
  @Transform(parseJson)
  @IsObject()
  socialLinks?: Record<string, string>;


  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @IsOptional()
  @IsBoolean()
  allowVideoReviews?: boolean;

  @IsOptional()
  @IsBoolean()
  allowTextReviews?: boolean;

  @IsOptional()
  @IsBoolean()
  allowAudioReviews?: boolean;
}