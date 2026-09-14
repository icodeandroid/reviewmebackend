import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Req,
} from '@nestjs/common';

import { MediaService } from './media.service';
import { UploadMediaDto } from './dto/upload-media.dto';

@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
  ) {}

  @Post('upload')
  upload(@Body() dto: UploadMediaDto, @Req() req: any) {
    const businessId = req.businessId || 'temp-business';
    return this.mediaService.upload(dto, businessId);
  }

  @Get('storage-status')
  storageStatus(@Req() req: any) {
    const businessId = req.businessId || 'temp-business';
    return this.mediaService.getStorageStatus(businessId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }
}