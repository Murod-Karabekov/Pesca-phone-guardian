package com.pesca.phoneguardian.scan

data class ScannedApp(
    val packageName: String,
    val appLabel: String,
    val versionName: String?,
    val versionCode: Long,
    val installerPackage: String?,
    val isSystemApp: Boolean,
    val requestedPermissions: List<String>,
    val dangerousPermissions: List<String>,
    val localRiskScore: Int,
    val localRiskLevel: String,
    val riskReasons: List<String>,
)
