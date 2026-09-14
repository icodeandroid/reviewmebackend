import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaFile } from './entities/media-file.entity';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { UploadProvider } from './providers/upload.provider';
import { StorageProvider } from './providers/storage.provider';

@Module({
  imports: [TypeOrmModule.forFeature([MediaFile])],
  controllers: [MediaController],
  providers: [MediaService, UploadProvider, StorageProvider],
  exports: [MediaService, StorageProvider],
})
export class MediaModule {}