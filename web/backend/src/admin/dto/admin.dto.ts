import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  AppVerdict,
  NotificationType,
  RiskLevel,
  ScanReportStatus,
} from '@prisma/client';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

export class UsersQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
}

export class ReportsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(ScanReportStatus)
  status?: ScanReportStatus;

  @IsOptional()
  @IsEnum(RiskLevel)
  riskLevel?: RiskLevel;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;
}

export class PatchReportStatusDto {
  @IsEnum(ScanReportStatus)
  status!: ScanReportStatus;

  @IsOptional()
  @IsString()
  analystNote?: string;
}

export class ReviewAppDto {
  @IsString()
  installedAppId!: string;

  @IsEnum(AppVerdict)
  verdict!: AppVerdict;

  @IsOptional()
  @IsString()
  recommendation?: string;
}

export class NotifyUserDto {
  @IsString()
  title!: string;

  @IsString()
  message!: string;

  @IsEnum(NotificationType)
  type!: NotificationType;
}
