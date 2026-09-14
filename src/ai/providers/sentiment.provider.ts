import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

@Injectable()
export class SentimentProvider {
  private readonly webhookUrl = process.env.N8N_SENTIMENT_WEBHOOK_URL || '';

  async analyze(text: string): Promise<{
    sentiment: string;
    confidenceScore: number;
  }> {
    if (!this.webhookUrl) {
      throw new InternalServerErrorException(
        'n8n sentiment webhook URL not configured',
      );
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`n8n responded with status ${response.status}`);
      }

      const data = await response.json();

      return {
        sentiment: data.sentiment || 'neutral',
        confidenceScore: Number(data.confidenceScore) || 0,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error';

      throw new InternalServerErrorException(
        `Sentiment analysis failed: ${message}`,
      );
    }
  }
}