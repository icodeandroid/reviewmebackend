import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { BusinessesService } from '../businesses/businesses.service';

@Controller('validation')
export class ValidationController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Public()
  @Get('slug/check/:slug')
  async checkSlug(@Param('slug') slug: string) {
    const available = await this.businessesService.isSlugAvailable(
      slug.toLowerCase().trim(),
    );
    return { available };
  }

  @Public()
  @Get('slug/suggest')
  async suggestSlug(@Query('name') name: string) {
    const base = (name || '')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const candidates = [
      `${base}-hq`,
      `${base}-official`,
      `${base}-${new Date().getFullYear()}`,
      `${base}-${Math.floor(100 + Math.random() * 900)}`,
    ];

    const suggestions: string[] = [];
    for (const candidate of candidates) {
      if (await this.businessesService.isSlugAvailable(candidate)) {
        suggestions.push(candidate);
      }
    }
    return { suggestions };
  }
}