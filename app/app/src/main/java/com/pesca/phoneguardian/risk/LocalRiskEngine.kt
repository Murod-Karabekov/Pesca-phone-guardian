package com.pesca.phoneguardian.risk

import java.util.Locale

private const val PLAY = "com.android.vending"

data class LocalRiskResult(
    val score: Int,
    val level: String,
    val reasons: List<String>,
)

object LocalRiskEngine {

    fun score(
        packageName: String,
        isSystemApp: Boolean,
        installerPackage: String?,
        requestedPermissions: List<String>,
    ): LocalRiskResult {
        var score = 0
        val reasons = mutableListOf<String>()
        val perms = requestedPermissions.map { it.trim().uppercase(Locale.ROOT) }.toSet()
        val installer = installerPackage?.trim()?.lowercase(Locale.ROOT).orEmpty().ifEmpty { null }
        val fromPlay = installer == PLAY
        val trustedApp = isSystemApp || fromPlay

        if (isSystemApp) {
            reasons.add("Tizim ilovasi (ishonchli)")
        } else if (fromPlay) {
            reasons.add("Ishonchli o'rnatuvchi (Google Play)")
        } else {
            score += 50
            reasons.add("Play Marketdan o'rnatilmagan bo'lishi mumkin")
            if (installer == null) reasons.add("Noma'lum o'rnatish manbai")
        }
        if (!trustedApp && (perms.contains("ANDROID.PERMISSION.SEND_SMS") || perms.contains("ANDROID.PERMISSION.RECEIVE_SMS"))) {
            score += 20
            reasons.add("SMS ruxsati so'ralgan")
        }
        if (!trustedApp && perms.contains("ANDROID.PERMISSION.BIND_ACCESSIBILITY_SERVICE")) {
            score += 25
            reasons.add("Accessibility bilan bog'liq ruxsat")
        }
        if (!trustedApp && perms.contains("ANDROID.PERMISSION.SYSTEM_ALERT_WINDOW")) {
            score += 20
            reasons.add("Overlay (SYSTEM_ALERT_WINDOW) ruxsati")
        }
        if (!trustedApp && perms.contains("ANDROID.PERMISSION.READ_CONTACTS")) {
            score += 10
            reasons.add("READ_CONTACTS ruxsati")
        }
        if (!trustedApp && perms.contains("ANDROID.PERMISSION.RECORD_AUDIO")) {
            score += 10
            reasons.add("RECORD_AUDIO ruxsati")
        }
        if (!trustedApp && perms.contains("ANDROID.PERMISSION.CAMERA")) {
            score += 8
            reasons.add("CAMERA ruxsati")
        }
        if (!trustedApp && perms.contains("ANDROID.PERMISSION.READ_PHONE_STATE")) {
            score += 10
            reasons.add("READ_PHONE_STATE ruxsati")
        }
        if (!trustedApp && perms.contains("ANDROID.PERMISSION.REQUEST_INSTALL_PACKAGES")) {
            score += 25
            reasons.add("REQUEST_INSTALL_PACKAGES ruxsati")
        }
        score = score.coerceIn(0, 100)
        val level = when {
            score >= 81 -> "CRITICAL"
            score >= 61 -> "HIGH"
            score >= 31 -> "MEDIUM"
            else -> "LOW"
        }
        return LocalRiskResult(score, level, reasons.distinct())
    }
}
