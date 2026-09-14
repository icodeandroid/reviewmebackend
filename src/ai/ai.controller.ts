import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { AiService } from './ai.service';
import { SentimentDto } from './dto/sentiment.dto';
import { TranscriptionDto } from './dto/transcription.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Public()
  @Post('sentiment')
  analyzeSentiment(@Body() dto: SentimentDto) {
    return this.aiService.analyzeSentiment(dto);
  }

  @Public()
  @Post('transcribe')
  transcribe(@Body() dto: TranscriptionDto) {
    return this.aiService.transcribe(dto);
  }
}