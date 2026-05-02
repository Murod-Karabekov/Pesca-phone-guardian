import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class MobileRegisterDto {
  @IsString()
  phoneNumber!: string;

  @IsOptional()
  @IsString()
  deviceModel?: string;

  @IsOptional()
  @IsString()
  androidVersion?: string;

  @IsOptional()
  @IsString()
  appVersion?: string;
}

export class DeviceInfoDto {
  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsString()
  androidVersion?: string;

  @IsOptional()
  @IsInt()
  sdkVersion?: number;

  @IsOptional()
  @IsString()
  securityPatch?: string;

  @IsOptional()
  @IsString()
  deviceName?: string;
}

export class InstalledAppInputDto {
  @IsString()
  packageName!: string;

  @IsOptional()
  @IsString()
  appName?: string;

  @IsOptional()
  @IsString()
  versionName?: string;

  @IsOptional()
  @IsInt()
  versionCode?: number;

  @IsOptional()
  @IsString()
  installerPackage?: string | null;

  @IsBoolean()
  isSystemApp!: boolean;

  @IsArray()
  @IsString({ each: true })
  requestedPermissions!: string[];

  @IsArray()
  @IsString({ each: true })
  dangerousPermissions!: string[];

  @IsOptional()
  @IsInt()
  localRiskScore?: number;

  @IsOptional()
  @IsString()
  localRiskLevel?: string;

  @IsArray()
  @IsString({ each: true })
  riskReasons!: string[];
}

export class MobileScanReportDto {
  @IsString()
  phoneNumber!: string;

  @IsOptional()
  @IsString()
  appVersion?: string;

  @ValidateNested()
  @Type(() => DeviceInfoDto)
  device!: DeviceInfoDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InstalledAppInputDto)
  installedApps!: InstalledAppInputDto[];
}

export class MobileNotificationReadDto {
  @IsString()
  phoneNumber!: string;

  @IsArray()
  @IsString({ each: true })
  notificationIds!: string[];
}
