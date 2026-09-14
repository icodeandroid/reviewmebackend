import {
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SentimentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  text!: string;
}

export enum SentimentLabel {
  POSITIVE = 'POSITIVE',
  NEUTRAL = 'NEUTRAL',
  NEGATIVE = 'NEGATIVE',
}

export class AnalyseSentimentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  text!: string;
}

export interface SentimentAnalysisResult {


  confidence: number;

  keywords: string[];

  engine: string;

  processingMs: number;
}