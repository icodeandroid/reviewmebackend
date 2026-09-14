import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as path from 'path';
import * as fs from 'fs';

import { MediaFile, MediaType } from '../entities/media-file.entity';

const UPLOAD_DIRS: Record<MediaType, string> = {
  [MediaType.VIDEO]: 'uploads/video',
  [MediaType.AUDIO]: 'uploads/audio',
  [MediaType.IMAGE]: 'uploads/images',
};

const ALLOWED_MIME_TYPES: Record<MediaType, string[]> = {
  [MediaType.VIDEO]: ['video/mp4', 'video/webm', 'video/quicktime'],
  [MediaType.AUDIO]: ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/mp4'],
  [MediaType.IMAGE]: ['image/jpeg', 'image/png', 'image/webp'],
};

@Injectable()
export class UploadProvider {
  constructor(
    @InjectRepository(MediaFile)
    private readonly mediaRepository: Repository<MediaFile>,
  ) {}

  async saveBase64File(
    fileData: string,
    fileName: string,
    mimeType: string,
    type: MediaType,
    businessId: string,
    reviewId?: string,
  ): Promise<MediaFile> {
    if (!ALLOWED_MIME_TYPES[type].includes(mimeType)) {
      throw new BadRequestException(
        `Invalid file type for ${type}: ${mimeType}`,
      );
    }

    // Remove base64 prefix if present (data:video/mp4;base64,xxxx)
    const base64Data = fileData.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length === 0) {
      throw new BadRequestException('Empty or invalid file data');
    }

    const ext = path.extname(fileName) || this.getExtFromMime(mimeType);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const uploadDir = UPLOAD_DIRS[type];
    const filePath = path.join(uploadDir, uniqueName);

    fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(filePath, buffer);

    const media = this.mediaRepository.create({
      businessId,
      reviewId,
      fileName: uniqueName,
      filePath,
      type,
      sizeBytes: buffer.length,
      mimeType,
    });

    return this.mediaRepository.save(media);
  }

  async deleteFile(id: string): Promise<void> {
    const media = await this.mediaRepository.findOne({ where: { id } });

    if (media) {
      if (fs.existsSync(media.filePath)) {
        fs.unlinkSync(media.filePath);
      }
      await this.mediaRepository.remove(media);
    }
  }

  private getExtFromMime(mimeType: string): string {
    const map: Record<string, string> = {
      'video/mp4': '.mp4',
      'video/webm': '.webm',
      'video/quicktime': '.mov',
      'audio/mpeg': '.mp3',
      'audio/wav': '.wav',
      'audio/webm': '.webm',
      'audio/mp4': '.m4a',
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
    };

    return map[mimeType] || '';
  }
}