import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';

import { WidgetsService } from './widgets.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';

@Controller('widgets')
export class WidgetsController {
  constructor(
    private readonly widgetsService: WidgetsService,
  ) {}

  @Post()
  create(@Body() dto: CreateWidgetDto, @Req() req: any) {
    const businessId = req.businessId || 'temp-business';
    return this.widgetsService.create(businessId, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    const businessId = req.businessId || 'temp-business';
    return this.widgetsService.findAllByBusiness(businessId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWidgetDto) {
    return this.widgetsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.widgetsService.remove(id);
  }
}