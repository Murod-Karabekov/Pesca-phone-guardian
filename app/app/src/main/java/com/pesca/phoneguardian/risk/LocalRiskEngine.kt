package com.pesca.phoneguardian.risk

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
        val perms = requestedPermissions.map { it.uppercase() }.toSet()
        val installer = installerPackage?.trim().orEmpty().ifEmpty { null }
        val fromPlay = installer == PLAY

        if (!fromPlay) {
            score += 25
            reasons.add("Play Marketdan o'rnatilmagan bo'lishi mumkin")
        }
        if (installer == null) {
            score += 25
            reasons.add("Noma'lum o'rnatish manbai")
        }
        if (perms.contains("android.permission.SEND_SMS") || perms.contains("android.permission.RECEIVE_SMS")) {
            score += 20
            reasons.add("SMS ruxsati so'ralgan")
        }
        if (perms.contains("android.permission.BIND_ACCESSIBILITY_SERVICE")) {
            score += 25
            reasons.add("Accessibility bilan bog'liq ruxsat")
        }
        if (perms.contains("android.permission.SYSTEM_ALERT_WINDOW")) {
            score += 20
            reasons.add("Overlay (SYSTEM_ALERT_WINDOW) ruxsati")
        }
        if (perms.contains("android.permission.READ_CONTACTS")) {
            score += 10
            reasons.add("READ_CONTACTS ruxsati")
        }
        if (perms.contains("android.permission.RECORD_AUDIO")) {
            score += 10
            reasons.add("RECORD_AUDIO ruxsati")
        }
        if (perms.contains("android.permission.CAMERA")) {
            score += 8
            reasons.add("CAMERA ruxsati")
        }
        if (perms.contains("android.permission.READ_PHONE_STATE")) {
            score += 10
            reasons.add("READ_PHONE_STATE ruxsati")
        }
        if (perms.contains("android.permission.REQUEST_INSTALL_PACKAGES")) {
            score += 25
            reasons.add("REQUEST_INSTALL_PACKAGES ruxsati")
        }
        if (isSystemApp) {
            score -= 20
            reasons.add("Tizim ilovasi (xavf pastroq)")
        }
        if (installer == PLAY) {
            score -= 20
            reasons.add("Ishonchli o'rnatuvchi (Google Play)")
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
