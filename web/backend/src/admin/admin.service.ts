import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, RiskLevel, ScanReportStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard() {
    const [
      users,
      devices,
      reports,
      riskyApps,
      criticalApps,
      recentReports,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.device.count(),
      this.prisma.scanReport.count(),
      this.prisma.installedApp.count({
        where: { riskScore: { gte: 31 } },
      }),
      this.prisma.installedApp.count({
        where: { riskScore: { gte: 81 } },
      }),
      this.prisma.scanReport.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: true, device: true },
      }),
    ]);
    return {
      totals: { users, devices, reports, riskyApps, criticalApps },
      recentReports,
    };
  }

  async listDevices(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.device.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: true },
      }),
      this.prisma.device.count(),
    ]);
    return { items, total, page, limit };
  }

  async listUsers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = search
      ? { phoneNumber: { contains: search } }
      : {};
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { devices: true, scanReports: true } } },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        devices: true,
        scanReports: { orderBy: { createdAt: 'desc' }, take: 20 },
        notifications: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async listReports(query: {
    page?: number;
    limit?: number;
    status?: ScanReportStatus;
    riskLevel?: RiskLevel;
    from?: string;
    to?: string;
  }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.ScanReportWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }
    if (query.riskLevel) {
      where.installedApps = {
        some: { riskLevel: query.riskLevel },
      };
    }
    const [items, total] = await Promise.all([
      this.prisma.scanReport.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          device: true,
          _count: { select: { installedApps: true } },
        },
      }),
      this.prisma.scanReport.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async getReport(id: string) {
    const report = await this.prisma.scanReport.findUnique({
      where: { id },
      include: {
        user: true,
        device: true,
        installedApps: true,
        appReviews: { include: { analyst: true, installedApp: true } },
      },
    });
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  async updateReportStatus(id: string, status: ScanReportStatus, analystNote?: string) {
    return this.prisma.scanReport.update({
      where: { id },
      data: { status, analystNote: analystNote ?? undefined },
    });
  }

  async reviewApp(
    reportId: string,
    installedAppId: string,
    analystId: string,
    verdict: 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS',
    recommendation?: string,
  ) {
    const app = await this.prisma.installedApp.findFirst({
      where: { id: installedAppId, scanReportId: reportId },
    });
    if (!app) throw new NotFoundException('Installed app not in this report');
    return this.prisma.appReview.create({
      data: {
        scanReportId: reportId,
        installedAppId,
        analystId,
        verdict,
        recommendation,
      },
    });
  }

  async notifyUser(userId: string, title: string, message: string, type: 'INFO' | 'WARNING' | 'DANGER') {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.notification.create({
      data: { userId, title, message, type },
    });
  }
}
