import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RiskScoringService } from '../risk/risk-scoring.service';
import {
  DeviceInfoDto,
  InstalledAppInputDto,
  MobileRegisterDto,
  MobileScanReportDto,
} from './dto/mobile.dto';

@Injectable()
export class MobileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly risk: RiskScoringService,
  ) {}

  async register(dto: MobileRegisterDto) {
    const user = await this.prisma.user.upsert({
      where: { phoneNumber: dto.phoneNumber },
      create: {
        phoneNumber: dto.phoneNumber,
        deviceModel: dto.deviceModel,
        androidVersion: dto.androidVersion,
        appVersion: dto.appVersion,
      },
      update: {
        deviceModel: dto.deviceModel ?? undefined,
        androidVersion: dto.androidVersion ?? undefined,
        appVersion: dto.appVersion ?? undefined,
      },
    });
    return { userId: user.id, phoneNumber: user.phoneNumber };
  }

  private async findOrCreateDevice(userId: string, d: DeviceInfoDto) {
    const existing = await this.prisma.device.findFirst({
      where: {
        userId,
        model: d.model ?? null,
        manufacturer: d.manufacturer ?? null,
        brand: d.brand ?? null,
      },
    });
    if (existing) {
      return this.prisma.device.update({
        where: { id: existing.id },
        data: {
          androidVersion: d.androidVersion,
          sdkVersion: d.sdkVersion,
          securityPatch: d.securityPatch,
          deviceName: d.deviceName,
        },
      });
    }
    return this.prisma.device.create({
      data: {
        userId,
        brand: d.brand,
        model: d.model,
        manufacturer: d.manufacturer,
        androidVersion: d.androidVersion,
        sdkVersion: d.sdkVersion,
        securityPatch: d.securityPatch,
        deviceName: d.deviceName,
      },
    });
  }

  async createScanReport(dto: MobileScanReportDto) {
    const user = await this.prisma.user.upsert({
      where: { phoneNumber: dto.phoneNumber },
      create: {
        phoneNumber: dto.phoneNumber,
        appVersion: dto.appVersion,
      },
      update: {
        appVersion: dto.appVersion ?? undefined,
      },
    });

    const device = await this.findOrCreateDevice(user.id, dto.device);

    const scored: {
      input: InstalledAppInputDto;
      riskScore: number;
      riskLevel: ReturnType<RiskScoringService['scoreApp']>['riskLevel'];
      riskReasons: string[];
    }[] = [];

    for (const app of dto.installedApps) {
      const r = this.risk.scoreApp({
        packageName: app.packageName,
        appName: app.appName,
        versionName: app.versionName,
        versionCode: app.versionCode,
        installerPackage: app.installerPackage ?? null,
        isSystemApp: app.isSystemApp,
        requestedPermissions: app.requestedPermissions ?? [],
        dangerousPermissions: app.dangerousPermissions ?? [],
      });
      scored.push({ input: app, riskScore: r.riskScore, riskLevel: r.riskLevel, riskReasons: r.riskReasons });
    }

    const scores = scored.map((s) => s.riskScore);
    const overall = this.risk.overallFromApps(scores);
    const risky = scored.filter((s) => s.riskScore >= 31).length;
    const high = scored.filter((s) => s.riskScore >= 61 && s.riskScore < 81).length;
    const critical = scored.filter((s) => s.riskScore >= 81).length;

    const report = await this.prisma.scanReport.create({
      data: {
        userId: user.id,
        deviceId: device.id,
        totalApps: scored.length,
        riskyAppsCount: risky,
        highRiskAppsCount: high,
        criticalRiskAppsCount: critical,
        overallRiskScore: overall,
        status: 'NEW',
      },
    });

    if (scored.length > 0) {
      await this.prisma.installedApp.createMany({
        data: scored.map((s) => ({
          deviceId: device.id,
          scanReportId: report.id,
          packageName: s.input.packageName,
          appName: s.input.appName,
          versionName: s.input.versionName,
          versionCode: s.input.versionCode ?? null,
          installerPackage: s.input.installerPackage ?? null,
          isSystemApp: s.input.isSystemApp,
          requestedPermissions: s.input.requestedPermissions as object,
          dangerousPermissions: s.input.dangerousPermissions as object,
          riskScore: s.riskScore,
          riskLevel: s.riskLevel,
          riskReasons: s.riskReasons as object,
        })),
      });
    }

    const appsOut = scored.map((s) => ({
      packageName: s.input.packageName,
      riskScore: s.riskScore,
      riskLevel: s.riskLevel,
      riskReasons: s.riskReasons,
    }));

    return {
      reportId: report.id,
      overallRiskScore: overall,
      totalApps: scored.length,
      riskyAppsCount: risky,
      highRiskAppsCount: high,
      criticalRiskAppsCount: critical,
      status: report.status,
      apps: appsOut,
    };
  }

  async listNotifications(phoneNumber: string) {
    const user = await this.prisma.user.findUnique({ where: { phoneNumber } });
    if (!user) return [];
    return this.prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async markNotificationsRead(phoneNumber: string, ids: string[]) {
    const user = await this.prisma.user.findUnique({ where: { phoneNumber } });
    if (!user) throw new NotFoundException('User not found');
    await this.prisma.notification.updateMany({
      where: { userId: user.id, id: { in: ids } },
      data: { isRead: true },
    });
    return { ok: true };
  }

  listActiveAds(placement: string) {
    return this.prisma.advertisement.findMany({
      where: { placement, isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        placement: true,
        title: true,
        imageUrl: true,
        linkUrl: true,
      },
    });
  }
}
