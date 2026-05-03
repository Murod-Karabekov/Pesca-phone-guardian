package com.pesca.phoneguardian

import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.google.android.material.card.MaterialCardView
import androidx.lifecycle.lifecycleScope
import com.pesca.phoneguardian.ads.AdsBinder
import com.pesca.phoneguardian.api.ApiClient
import com.pesca.phoneguardian.notifications.NotificationsActivity
import com.pesca.phoneguardian.scan.ScanActivity
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private lateinit var statusText: TextView
    private lateinit var adsHomeContainer: LinearLayout
    private lateinit var homeAdsCard: MaterialCardView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        statusText = findViewById(R.id.statusText)
        adsHomeContainer = findViewById(R.id.adsHomeContainer)
        homeAdsCard = findViewById(R.id.homeAdsCard)
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
        loadHomeAds()
    }

    private fun loadHomeAds() {
        lifecycleScope.launch {
            try {
                val ads = ApiClient.mobile.listAds("HOME_MAIN")
                AdsBinder.populate(adsHomeContainer, ads, layoutInflater)
                homeAdsCard.visibility = if (ads.isNotEmpty()) View.VISIBLE else View.GONE
            } catch (_: Exception) {
                adsHomeContainer.removeAllViews()
                homeAdsCard.visibility = View.GONE
            }
        }
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
