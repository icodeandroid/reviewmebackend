import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/jwt-payload.interface';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics.dto';

@ApiTags('11. Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Headline analytics for a date range' })
  summary(@Query() query: AnalyticsQueryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.summary(query, user);
  }

  @Get('sentiment-distribution')
  @ApiOperation({ summary: 'Positive / neutral / negative split' })
  sentiment(@Query() query: AnalyticsQueryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.sentimentDistribution(query, user);
  }

  @Get('rating-distribution')
  @ApiOperation({ summary: 'Star rating histogram' })
  ratings(@Query() query: AnalyticsQueryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.ratingDistribution(query, user);
  }

  @Get('timeseries')
  @ApiOperation({ summary: 'Review volume and sentiment over time' })
  timeSeries(@Query() query: AnalyticsQueryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.timeSeries(query, user);
  }

  @Get('keywords')
  @ApiOperation({ summary: 'Most mentioned keywords by sentiment' })
  keywords(
    @Query() query: AnalyticsQueryDto,
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit?: string,
  ) {
    return this.analyticsService.keywords(query, user, limit ? parseInt(limit, 10) : 20);
  }

  @Get('export')
  @ApiOperation({ summary: 'Download the filtered reviews as CSV' })
  async export(
    @Query() query: AnalyticsQueryDto,
    @CurrentUser() user: AuthenticatedUser,
    @Res() response: Response,
  ) {
    const csv = await this.analyticsService.exportCsv(query, user);
    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader('Content-Disposition', 'attachment; filename="reviews-export.csv"');
    response.send(csv);
  }
}
