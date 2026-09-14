import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateBusinessDto, @CurrentUser() user: any) {
    return this.businessesService.create(dto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('private')
  getPrivateProfile(@CurrentUser() user: any) {
    return this.businessesService.findByOwner(user.id);
  }

  @Public()
  @Get('public/:slug')
  getPublicProfile(@Param('slug') slug: string) {
    return this.businessesService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('settings')
  updateSettings(@Body() dto: UpdateBusinessDto, @CurrentUser() user: any) {
    return this.businessesService.updateSettings(user.id, dto);
  }
}