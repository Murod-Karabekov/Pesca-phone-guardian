import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MobileService } from './mobile.service';
import {
  MobileNotificationReadDto,
  MobileRegisterDto,
  MobileScanReportDto,
} from './dto/mobile.dto';

@Controller('mobile')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class MobileController {
  constructor(private readonly mobile: MobileService) {}

  @Get('ads')
  ads(@Query('placement') placement?: string) {
    const p = placement === 'NOTIFICATIONS_FOOTER' ? 'NOTIFICATIONS_FOOTER' : 'HOME_MAIN';
    return this.mobile.listActiveAds(p);
  }

  @Post('register')
  register(@Body() dto: MobileRegisterDto) {
    return this.mobile.register(dto);
  }

  @Post('scan-report')
  scanReport(@Body() dto: MobileScanReportDto) {
    return this.mobile.createScanReport(dto);
  }

  @Get('notifications/:phoneNumber')
  notifications(@Param('phoneNumber') phoneNumber: string) {
    return this.mobile.listNotifications(phoneNumber);
  }

  @Post('notifications/read')
  readNotifications(@Body() dto: MobileNotificationReadDto) {
    return this.mobile.markNotificationsRead(dto.phoneNumber, dto.notificationIds);
  }
}
