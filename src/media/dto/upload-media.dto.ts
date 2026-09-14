import {
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

import { MediaType } from '../entities/media-file.entity';

export class UploadMediaDto {
  @IsEnum(MediaType)
  type!: MediaType;

  @IsString()
  fileName!: string;

  @IsString()
  mimeType!: string;

  @IsString()
  fileData!: string; // Base64 encoded

  @IsOptional()
  @IsString()
  reviewId?: string;
}