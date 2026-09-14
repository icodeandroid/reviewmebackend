import { Injectable } from '@nestjs/common';
import { AiOrchestratorProvider } from './providers/ai-orchestrator.provider';
import { SentimentProvider } from './providers/sentiment.provider';
import { WhisperProvider } from './providers/whisper.provider';
import { SentimentDto } from './dto/sentiment.dto';
import { TranscriptionDto } from './dto/transcription.dto';

@Injectable()
export class AiService {
  constructor(
    private readonly orchestrator: AiOrchestratorProvider,
    private readonly sentimentProvider: SentimentProvider,
    private readonly whisperProvider: WhisperProvider,
  ) {}

  async analyzeSentiment(dto: SentimentDto) {
    return this.sentimentProvider.analyze(dto.text);
  }

  async transcribe(dto: TranscriptionDto) {
  return this.whisperProvider.transcribe(dto.audioData ?? '');
}

  async processReview(input: { text?: string; audioData?: string }) {
    return this.orchestrator.processReview(input);
  }
}