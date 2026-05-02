-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'CYBER_SECURITY_AGENT', 'VIEWER');

CREATE TYPE "ScanReportStatus" AS ENUM ('NEW', 'REVIEWING', 'SAFE', 'DANGEROUS', 'CLOSED');

CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

CREATE TYPE "AppVerdict" AS ENUM ('SAFE', 'SUSPICIOUS', 'DANGEROUS');

CREATE TYPE "NotificationType" AS ENUM ('INFO', 'WARNING', 'DANGER');

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "device_model" TEXT,
    "android_version" TEXT,
    "app_version" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_phone_number_key" ON "User"("phone_number");

CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "manufacturer" TEXT,
    "android_version" TEXT,
    "sdk_version" INTEGER,
    "security_patch" TEXT,
    "device_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ScanReport" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "total_apps" INTEGER NOT NULL,
    "risky_apps_count" INTEGER NOT NULL,
    "high_risk_apps_count" INTEGER NOT NULL,
    "critical_risk_apps_count" INTEGER NOT NULL,
    "overall_risk_score" INTEGER NOT NULL,
    "status" "ScanReportStatus" NOT NULL DEFAULT 'NEW',
    "analyst_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScanReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InstalledApp" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "scan_report_id" TEXT NOT NULL,
    "package_name" TEXT NOT NULL,
    "app_name" TEXT,
    "version_name" TEXT,
    "version_code" INTEGER,
    "installer_package" TEXT,
    "is_system_app" BOOLEAN NOT NULL DEFAULT false,
    "requested_permissions" JSONB,
    "dangerous_permissions" JSONB,
    "risk_score" INTEGER NOT NULL,
    "risk_level" "RiskLevel" NOT NULL,
    "risk_reasons" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InstalledApp_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AppReview" (
    "id" TEXT NOT NULL,
    "scan_report_id" TEXT NOT NULL,
    "installed_app_id" TEXT NOT NULL,
    "analyst_id" TEXT NOT NULL,
    "verdict" "AppVerdict" NOT NULL,
    "recommendation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppReview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Device" ADD CONSTRAINT "Device_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ScanReport" ADD CONSTRAINT "ScanReport_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ScanReport" ADD CONSTRAINT "ScanReport_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InstalledApp" ADD CONSTRAINT "InstalledApp_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InstalledApp" ADD CONSTRAINT "InstalledApp_scan_report_id_fkey" FOREIGN KEY ("scan_report_id") REFERENCES "ScanReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AppReview" ADD CONSTRAINT "AppReview_scan_report_id_fkey" FOREIGN KEY ("scan_report_id") REFERENCES "ScanReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AppReview" ADD CONSTRAINT "AppReview_installed_app_id_fkey" FOREIGN KEY ("installed_app_id") REFERENCES "InstalledApp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AppReview" ADD CONSTRAINT "AppReview_analyst_id_fkey" FOREIGN KEY ("analyst_id") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
