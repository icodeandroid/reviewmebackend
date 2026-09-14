import { IsOptional, IsString } from 'class-validator';

export class TranscriptionDto {
  @IsOptional()
  @IsString()
  audioData?: string;

  @IsOptional()
  @IsString()
  mediaId?: string;
}

export { TranscriptionDto as TranscribeDto };