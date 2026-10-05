import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

import { ReviewsService } from './reviews.service';

import { CreateReviewDto } from './dto/create-review.dto';

import {
  UpdateReviewStatusDto,
} from './dto/update-review-status.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
  ) {}

    @Post()
  @UseInterceptors(AnyFilesInterceptor())
  create(
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(dto);
  }

  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }

  @Get('public/:businessId')
  findPublic(
    @Param('businessId')
    businessId: string,
  ) {
    return this.reviewsService.findPublic(
      businessId,
    );
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id')
    id: string,
    @Body()
    dto: UpdateReviewStatusDto,
  ) {
    return this.reviewsService.updateStatus(
      id,
      dto.status,
    );
  }

  @Delete(':id')
  remove(
    @Param('id')
    id: string,
  ) {
    return this.reviewsService.remove(id);
  }
}