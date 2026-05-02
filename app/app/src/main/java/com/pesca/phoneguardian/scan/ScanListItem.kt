package com.pesca.phoneguardian.scan

sealed class ScanListItem {
    data class Header(val title: String) : ScanListItem()
    data class AppRow(val app: ScannedApp) : ScanListItem()
}
