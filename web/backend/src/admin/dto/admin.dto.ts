import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
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

const HTTP_URL_RE = /^https?:\/\/.+/;

export class AdsQueryDto {
  @IsOptional()
  @IsIn(['HOME_MAIN', 'NOTIFICATIONS_FOOTER'])
  placement?: string;
}

export class CreateAdvertisementDto {
  @IsIn(['HOME_MAIN', 'NOTIFICATIONS_FOOTER'])
  placement!: 'HOME_MAIN' | 'NOTIFICATIONS_FOOTER';

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  @Matches(HTTP_URL_RE, { message: 'imageUrl must be http(s)' })
  imageUrl?: string;

  @IsString()
  @Matches(HTTP_URL_RE, { message: 'linkUrl must be http(s)' })
  linkUrl!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class PatchAdvertisementDto {
  @IsOptional()
  @IsIn(['HOME_MAIN', 'NOTIFICATIONS_FOOTER'])
  placement?: 'HOME_MAIN' | 'NOTIFICATIONS_FOOTER';

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  @Matches(HTTP_URL_RE, { message: 'imageUrl must be http(s)' })
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @Matches(HTTP_URL_RE, { message: 'linkUrl must be http(s)' })
  linkUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
