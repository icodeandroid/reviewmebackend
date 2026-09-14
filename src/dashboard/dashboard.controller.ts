import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums';
import { AuthenticatedUser } from '../common/interfaces/jwt-payload.interface';
import { DashboardService } from './dashboard.service';

@ApiTags('8. Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /** TC-09 — dashboard statistics. */
  @Get('overview')
  @ApiOperation({ summary: 'Headline statistics for my businesses' })
  overview(@CurrentUser() user: AuthenticatedUser, @Query('businessId') businessId?: string) {
    return this.dashboardService.overview(user, businessId);
  }

  @Get('recent-reviews')
  @ApiOperation({ summary: 'Most recent reviews across my businesses' })
  recent(
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit?: string,
    @Query('businessId') businessId?: string,
  ) {
    return this.dashboardService.recentReviews(
      user,
      limit ? parseInt(limit, 10) : 5,
      businessId,
    );
  }

  @Get('admin')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'System-wide statistics (admin only)' })
  adminOverview() {
    return this.dashboardService.adminOverview();
  }
}
