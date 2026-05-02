package com.pesca.phoneguardian

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.os.SystemClock
import android.view.accessibility.AccessibilityEvent

class ApkInstallAccessibilityService : AccessibilityService() {

    private var lastWarningAt = 0L
    private var installerSessionActive = false

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        val safeEvent = event ?: return
        if (safeEvent.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return

        val pkg = safeEvent.packageName?.toString().orEmpty()
        if (pkg == packageName) {
            return
        }
        if (!isInstallerPackage(pkg)) {
            installerSessionActive = false
            return
        }
        if (SystemClock.elapsedRealtime() < suppressWarningsUntil) return
        if (installerSessionActive) return
        installerSessionActive = true

        val now = SystemClock.elapsedRealtime()
        if (now - lastWarningAt < WARNING_DEBOUNCE_MS) return
        lastWarningAt = now

        val warningIntent = Intent(this, WarningActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        }
        startActivity(warningIntent)
    }

    override fun onInterrupt() = Unit

    override fun onServiceConnected() {
        super.onServiceConnected()
        installerSessionActive = false
    }

    override fun onDestroy() {
        super.onDestroy()
        installerSessionActive = false
    }

    private fun isInstallerPackage(packageName: String): Boolean {
        return packageName == PACKAGE_INSTALLER ||
            packageName == GOOGLE_PACKAGE_INSTALLER ||
            packageName == PERMISSION_CONTROLLER ||
            packageName == XIAOMI_PACKAGE_INSTALLER ||
            packageName == SAMSUNG_PACKAGE_INSTALLER ||
            packageName == HUAWEI_PACKAGE_INSTALLER ||
            packageName == OPPO_PACKAGE_INSTALLER ||
            packageName == VIVO_PACKAGE_INSTALLER
    }

    companion object {
        private const val WARNING_DEBOUNCE_MS = 1200L

        private const val PACKAGE_INSTALLER = "com.android.packageinstaller"
        private const val GOOGLE_PACKAGE_INSTALLER = "com.google.android.packageinstaller"
        private const val PERMISSION_CONTROLLER = "com.android.permissioncontroller"
        private const val XIAOMI_PACKAGE_INSTALLER = "com.miui.packageinstaller"
        private const val SAMSUNG_PACKAGE_INSTALLER = "com.samsung.android.packageinstaller"
        private const val HUAWEI_PACKAGE_INSTALLER = "com.huawei.appmarket"
        private const val OPPO_PACKAGE_INSTALLER = "com.oplus.safecenter"
        private const val VIVO_PACKAGE_INSTALLER = "com.vivo.permissionmanager"

        @Volatile
        private var suppressWarningsUntil: Long = 0L

        fun suppressWarningsTemporarily() {
            suppressWarningsUntil = SystemClock.elapsedRealtime() + 4000L
        }
    }
}
