import { Injectable } from '@nestjs/common';

import { WhisperProvider } from './whisper.provider';
import { SentimentProvider } from './sentiment.provider';

@Injectable()
export class AiOrchestratorProvider {
  constructor(
    private readonly whisperProvider: WhisperProvider,
    private readonly sentimentProvider: SentimentProvider,
  ) {}

  // Pura flow: agar media hai toh pehle transcribe, phir sentiment
  async processReview(input: {
    text?: string;
    mediaUrl?: string;
  }): Promise<{
    transcript: string;
    sentiment: string;
    confidenceScore: number;
  }> {
    let transcript = input.text || '';

    // Agar media diya hai (video/audio) toh pehle transcribe karo
    if (input.mediaUrl) {
      const result = await this.whisperProvider.transcribe(input.mediaUrl);
      transcript = result.transcript;
    }

    // Phir us text pe sentiment analysis
    const sentimentResult = await this.sentimentProvider.analyze(transcript);

    return {
      transcript,
      sentiment: sentimentResult.sentiment,
      confidenceScore: sentimentResult.confidenceScore,
    };
  }
}