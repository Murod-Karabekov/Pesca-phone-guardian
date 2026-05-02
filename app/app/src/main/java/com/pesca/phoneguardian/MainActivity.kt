package com.pesca.phoneguardian

import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.appcompat.app.AppCompatActivity
import com.pesca.phoneguardian.notifications.NotificationsActivity
import com.pesca.phoneguardian.scan.ScanActivity

class MainActivity : AppCompatActivity() {

    private lateinit var statusText: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        statusText = findViewById(R.id.statusText)
        val openAccessibilityButton = findViewById<Button>(R.id.openAccessibilityButton)
        val refreshStatusButton = findViewById<Button>(R.id.refreshStatusButton)
        val openScanButton = findViewById<Button>(R.id.openScanButton)
        val openNotificationsButton = findViewById<Button>(R.id.openNotificationsButton)

        openAccessibilityButton.setOnClickListener {
            startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
        }

        refreshStatusButton.setOnClickListener {
            updateStatus()
            val msg = if (AccessibilityState.isServiceEnabled(this)) {
                getString(R.string.protection_on)
            } else {
                getString(R.string.protection_off)
            }
            Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
        }

        openScanButton.setOnClickListener {
            startActivity(Intent(this, ScanActivity::class.java))
        }

        openNotificationsButton.setOnClickListener {
            startActivity(Intent(this, NotificationsActivity::class.java))
        }
    }

    override fun onResume() {
        super.onResume()
        updateStatus()
    }

    private fun updateStatus() {
        val enabled = AccessibilityState.isServiceEnabled(this)
        if (enabled) {
            statusText.text = getString(R.string.protection_on)
            statusText.setTextColor(ContextCompat.getColor(this, R.color.success_green))
        } else {
            statusText.text = getString(R.string.protection_off)
            statusText.setTextColor(ContextCompat.getColor(this, R.color.danger_red))
        }
    }
}
