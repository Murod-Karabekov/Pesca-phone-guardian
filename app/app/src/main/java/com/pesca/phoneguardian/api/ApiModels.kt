package com.pesca.phoneguardian.api

import com.google.gson.annotations.SerializedName

data class MobileRegisterRequest(
    @SerializedName("phoneNumber") val phoneNumber: String,
    @SerializedName("deviceModel") val deviceModel: String?,
    @SerializedName("androidVersion") val androidVersion: String?,
    @SerializedName("appVersion") val appVersion: String?,
)

data class MobileRegisterResponse(
    @SerializedName("userId") val userId: String,
    @SerializedName("phoneNumber") val phoneNumber: String,
)

data class DeviceInfoRequest(
    @SerializedName("brand") val brand: String?,
    @SerializedName("model") val model: String?,
    @SerializedName("manufacturer") val manufacturer: String?,
    @SerializedName("androidVersion") val androidVersion: String?,
    @SerializedName("sdkVersion") val sdkVersion: Int?,
    @SerializedName("securityPatch") val securityPatch: String?,
    @SerializedName("deviceName") val deviceName: String?,
)

data class InstalledAppPayload(
    @SerializedName("packageName") val packageName: String,
    @SerializedName("appName") val appName: String?,
    @SerializedName("versionName") val versionName: String?,
    @SerializedName("versionCode") val versionCode: Int?,
    @SerializedName("installerPackage") val installerPackage: String?,
    @SerializedName("isSystemApp") val isSystemApp: Boolean,
    @SerializedName("requestedPermissions") val requestedPermissions: List<String>,
    @SerializedName("dangerousPermissions") val dangerousPermissions: List<String>,
    @SerializedName("localRiskScore") val localRiskScore: Int,
    @SerializedName("localRiskLevel") val localRiskLevel: String,
    @SerializedName("riskReasons") val riskReasons: List<String>,
)

data class MobileScanReportRequest(
    @SerializedName("phoneNumber") val phoneNumber: String,
    @SerializedName("appVersion") val appVersion: String?,
    @SerializedName("device") val device: DeviceInfoRequest,
    @SerializedName("installedApps") val installedApps: List<InstalledAppPayload>,
)

data class MobileScanReportResponse(
    @SerializedName("reportId") val reportId: String,
    @SerializedName("overallRiskScore") val overallRiskScore: Int,
    @SerializedName("totalApps") val totalApps: Int,
    @SerializedName("riskyAppsCount") val riskyAppsCount: Int,
    @SerializedName("highRiskAppsCount") val highRiskAppsCount: Int,
    @SerializedName("criticalRiskAppsCount") val criticalRiskAppsCount: Int,
    @SerializedName("status") val status: String,
)

data class NotificationReadRequest(
    @SerializedName("phoneNumber") val phoneNumber: String,
    @SerializedName("notificationIds") val notificationIds: List<String>,
)

data class OkResponse(
    @SerializedName("ok") val ok: Boolean,
)

data class NotificationDto(
    @SerializedName("id") val id: String,
    @SerializedName("title") val title: String,
    @SerializedName("message") val message: String,
    @SerializedName("type") val type: String,
    @SerializedName("isRead") val isRead: Boolean,
    @SerializedName("createdAt") val createdAt: String,
)

data class AdDto(
    @SerializedName("id") val id: String,
    @SerializedName("placement") val placement: String,
    @SerializedName("title") val title: String?,
    @SerializedName("imageUrl") val imageUrl: String?,
    @SerializedName("linkUrl") val linkUrl: String,
)
