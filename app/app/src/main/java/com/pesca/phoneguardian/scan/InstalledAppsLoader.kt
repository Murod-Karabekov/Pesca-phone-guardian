package com.pesca.phoneguardian.scan

import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.os.Build
import com.pesca.phoneguardian.risk.LocalRiskEngine

object InstalledAppsLoader {

    private val dangerousWhitelist = setOf(
        "android.permission.SEND_SMS",
        "android.permission.RECEIVE_SMS",
        "android.permission.READ_SMS",
        "android.permission.READ_CONTACTS",
        "android.permission.WRITE_CONTACTS",
        "android.permission.RECORD_AUDIO",
        "android.permission.CAMERA",
        "android.permission.READ_PHONE_STATE",
        "android.permission.CALL_PHONE",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.SYSTEM_ALERT_WINDOW",
        "android.permission.REQUEST_INSTALL_PACKAGES",
        "android.permission.BIND_ACCESSIBILITY_SERVICE",
    )

    fun load(context: Context): List<ScannedApp> {
        val pm = context.packageManager
        val apps = pm.getInstalledApplications(PackageManager.GET_META_DATA)
        val out = ArrayList<ScannedApp>(apps.size)
        for (ai in apps) {
            val pkg = ai.packageName ?: continue
            val label = ai.loadLabel(pm).toString()
            val isSystem = (ai.flags and ApplicationInfo.FLAG_SYSTEM) != 0 ||
                (ai.flags and ApplicationInfo.FLAG_UPDATED_SYSTEM_APP) != 0
            val pi = try {
                pm.getPackageInfo(pkg, PackageManager.GET_PERMISSIONS)
            } catch (_: Exception) {
                continue
            }
            val perms = pi.requestedPermissions?.toList().orEmpty()
            val dangerous = perms.filter { dangerousWhitelist.contains(it) }
            val installer = getInstaller(pm, pkg)
            val risk = LocalRiskEngine.score(pkg, isSystem, installer, perms)
            val versionName = pi.versionName
            val versionCode = if (Build.VERSION.SDK_INT >= 28) pi.longVersionCode else @Suppress("DEPRECATION") pi.versionCode.toLong()
            out.add(
                ScannedApp(
                    packageName = pkg,
                    appLabel = label,
                    versionName = versionName,
                    versionCode = versionCode,
                    installerPackage = installer,
                    isSystemApp = isSystem,
                    requestedPermissions = perms,
                    dangerousPermissions = dangerous,
                    localRiskScore = risk.score,
                    localRiskLevel = risk.level,
                    riskReasons = risk.reasons,
                ),
            )
        }
        return out.sortedByDescending { it.localRiskScore }
    }

    private fun getInstaller(pm: PackageManager, packageName: String): String? {
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                pm.getInstallSourceInfo(packageName).installingPackageName
            } else {
                @Suppress("DEPRECATION")
                pm.getInstallerPackageName(packageName)
            }
        } catch (_: Exception) {
            null
        }
    }
}
