import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MediaFile } from './entities/media-file.entity';
import { UploadMediaDto } from './dto/upload-media.dto';
import { UploadProvider } from './providers/upload.provider';
import { StorageProvider } from './providers/storage.provider';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(MediaFile)
    private readonly mediaRepository: Repository<MediaFile>,

    private readonly uploadProvider: UploadProvider,
    private readonly storageProvider: StorageProvider,
  ) {}

  async upload(dto: UploadMediaDto, businessId: string): Promise<MediaFile> {
    const estimatedSize = Math.ceil((dto.fileData.length * 3) / 4);

    const hasSpace = await this.storageProvider.hasSpace(
      businessId,
      estimatedSize,
    );

    if (!hasSpace) {
      throw new ForbiddenException('Storage limit exceeded');
    }

    return this.uploadProvider.saveBase64File(
      dto.fileData,
      dto.fileName,
      dto.mimeType,
      dto.type,
      businessId,
      dto.reviewId,
    );
  }

  async getStorageStatus(businessId: string, plan?: string) {
    return this.storageProvider.getStorageStatus(businessId, plan);
  }

  async findById(id: string): Promise<MediaFile> {
    const media = await this.mediaRepository.findOne({ where: { id } });

    if (!media) {
      throw new NotFoundException('Media file not found');
    }

    return media;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    await this.findById(id);
    await this.uploadProvider.deleteFile(id);
    return { deleted: true };
  }
}