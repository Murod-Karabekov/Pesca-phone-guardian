package com.pesca.phoneguardian

import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Context
import android.view.accessibility.AccessibilityManager

object AccessibilityState {

    fun isServiceEnabled(context: Context): Boolean {
        val manager = context.getSystemService(Context.ACCESSIBILITY_SERVICE) as AccessibilityManager
        val enabledServices =
            manager.getEnabledAccessibilityServiceList(AccessibilityServiceInfo.FEEDBACK_ALL_MASK)
        return enabledServices.any { info ->
            val id = info.id
            id.contains(context.packageName) &&
                id.contains(ApkInstallAccessibilityService::class.java.simpleName)
        }
    }
}
