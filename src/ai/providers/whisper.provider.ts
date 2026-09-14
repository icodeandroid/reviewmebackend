import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

@Injectable()
export class WhisperProvider {
  private readonly webhookUrl = process.env.N8N_TRANSCRIPTION_WEBHOOK_URL || '';

  async transcribe(mediaUrl: string): Promise<{ transcript: string }> {
    if (!this.webhookUrl) {
      throw new InternalServerErrorException(
        'n8n transcription webhook URL not configured',
      );
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaUrl }),
      });

      if (!response.ok) {
        throw new Error(`n8n responded with status ${response.status}`);
      }

      const data = await response.json();

      return {
        transcript: data.transcript || '',
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error';

      throw new InternalServerErrorException(
        `Transcription failed: ${message}`,
      );
    }
  }
}