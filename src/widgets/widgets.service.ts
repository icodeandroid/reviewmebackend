import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Widget } from './entities/widget.entity';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';

@Injectable()
export class WidgetsService {
  constructor(
    @InjectRepository(Widget)
    private readonly widgetRepository: Repository<Widget>,
  ) {}

  async create(businessId: string, dto: CreateWidgetDto): Promise<Widget> {
    const widget = this.widgetRepository.create({
      ...dto,
      businessId,
    });

    return this.widgetRepository.save(widget);
  }

  async findAllByBusiness(businessId: string): Promise<Widget[]> {
    return this.widgetRepository.find({
      where: { businessId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Widget> {
    const widget = await this.widgetRepository.findOne({
      where: { id },
    });

    if (!widget) {
      throw new NotFoundException('Widget not found');
    }

    return widget;
  }

  async update(id: string, dto: UpdateWidgetDto): Promise<Widget> {
    const widget = await this.findById(id);
    Object.assign(widget, dto);
    return this.widgetRepository.save(widget);
  }

  async remove(id: string) {
    const widget = await this.findById(id);
    return this.widgetRepository.remove(widget);
  }
}