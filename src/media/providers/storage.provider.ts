import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MediaFile } from '../entities/media-file.entity';

const STORAGE_LIMITS: Record<string, number> = {
  Starter: 1 * 1024 * 1024 * 1024,
  Pro: 10 * 1024 * 1024 * 1024,
  Enterprise: 100 * 1024 * 1024 * 1024,
};

@Injectable()
export class StorageProvider {
  constructor(
    @InjectRepository(MediaFile)
    private readonly mediaRepository: Repository<MediaFile>,
  ) {}

  async getUsedStorage(businessId: string): Promise<number> {
    const result = await this.mediaRepository
      .createQueryBuilder('media')
      .select('SUM(media.sizeBytes)', 'total')
      .where('media.businessId = :businessId', { businessId })
      .getRawOne();

    return Number(result?.total) || 0;
  }

  async getStorageStatus(businessId: string, plan: string = 'Starter') {
    const used = await this.getUsedStorage(businessId);
    const limit = STORAGE_LIMITS[plan] || STORAGE_LIMITS.Starter;

    return {
      usedBytes: used,
      limitBytes: limit,
      usedPercentage: Math.round((used / limit) * 100),
      remainingBytes: limit - used,
    };
  }

  async hasSpace(
    businessId: string,
    fileSize: number,
    plan: string = 'Starter',
  ): Promise<boolean> {
    const status = await this.getStorageStatus(businessId, plan);
    return status.remainingBytes >= fileSize;
  }
}