import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AdminRole } from '@prisma/client';
import { Roles } from './decorators/roles.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AdminService } from './admin.service';
import {
  NotifyUserDto,
  PatchReportStatusDto,
  ReportsQueryDto,
  ReviewAppDto,
  UsersQueryDto,
} from './dto/admin.dto';

type Authed = { user: { id: string; role: AdminRole } };

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class AdminManagementController {
  constructor(private readonly admin: AdminService) {}

  @Get('dashboard')
  dashboard() {
    return this.admin.dashboard();
  }

  @Get('devices')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CYBER_SECURITY_AGENT, AdminRole.VIEWER)
  devices(@Query() q: UsersQueryDto) {
    return this.admin.listDevices(q.page, q.limit);
  }

  @Get('users')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CYBER_SECURITY_AGENT, AdminRole.VIEWER)
  users(@Query() q: UsersQueryDto) {
    return this.admin.listUsers(q.page, q.limit, q.search);
  }

  @Get('users/:id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CYBER_SECURITY_AGENT, AdminRole.VIEWER)
  user(@Param('id') id: string) {
    return this.admin.getUser(id);
  }

  @Get('reports')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CYBER_SECURITY_AGENT, AdminRole.VIEWER)
  reports(@Query() q: ReportsQueryDto) {
    return this.admin.listReports(q);
  }

  @Get('reports/:id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CYBER_SECURITY_AGENT, AdminRole.VIEWER)
  report(@Param('id') id: string) {
    return this.admin.getReport(id);
  }

  @Patch('reports/:id/status')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CYBER_SECURITY_AGENT)
  patchReportStatus(@Param('id') id: string, @Body() dto: PatchReportStatusDto) {
    return this.admin.updateReportStatus(id, dto.status, dto.analystNote);
  }

  @Post('reports/:id/review-app')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CYBER_SECURITY_AGENT)
  reviewApp(
    @Param('id') id: string,
    @Body() dto: ReviewAppDto,
    @Req() req: Authed,
  ) {
    return this.admin.reviewApp(
      id,
      dto.installedAppId,
      req.user.id,
      dto.verdict,
      dto.recommendation,
    );
  }

  @Post('users/:id/notify')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CYBER_SECURITY_AGENT)
  notify(@Param('id') id: string, @Body() dto: NotifyUserDto) {
    return this.admin.notifyUser(id, dto.title, dto.message, dto.type);
  }
}
