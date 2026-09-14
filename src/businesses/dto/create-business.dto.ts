import {
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';

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
  website?: string;

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