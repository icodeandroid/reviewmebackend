import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiOrchestratorProvider } from './providers/ai-orchestrator.provider';
import { SentimentProvider } from './providers/sentiment.provider';
import { WhisperProvider } from './providers/whisper.provider';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [AiController],
  providers: [
    AiService,
    AiOrchestratorProvider,
    SentimentProvider,
    WhisperProvider,
  ],
  exports: [AiService],
})
export class AiModule {}