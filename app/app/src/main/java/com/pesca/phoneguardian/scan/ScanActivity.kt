package com.pesca.phoneguardian.scan

import android.os.Build
import android.util.Log
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.pesca.phoneguardian.BuildConfig
import com.pesca.phoneguardian.R
import com.pesca.phoneguardian.api.ApiClient
import com.pesca.phoneguardian.api.DeviceInfoRequest
import com.pesca.phoneguardian.api.InstalledAppPayload
import com.pesca.phoneguardian.api.MobileRegisterRequest
import com.pesca.phoneguardian.api.MobileScanReportRequest
import com.pesca.phoneguardian.databinding.ActivityScanBinding
import com.pesca.phoneguardian.databinding.DialogSubmitScanBinding
import com.pesca.phoneguardian.util.PhoneUtils
import com.pesca.phoneguardian.util.Prefs
import com.pesca.phoneguardian.util.UzbekPhoneFormatter
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import retrofit2.HttpException

class ScanActivity : AppCompatActivity() {

    private lateinit var binding: ActivityScanBinding
    private var items: List<ScannedApp> = emptyList()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityScanBinding.inflate(layoutInflater)
        setContentView(binding.root)
        binding.toolbar.setNavigationOnClickListener { finish() }
        binding.recycler.layoutManager = androidx.recyclerview.widget.LinearLayoutManager(this)

        binding.btnSubmitReview.setOnClickListener { showSubmitFlow() }

        lifecycleScope.launch {
            binding.progress.visibility = View.VISIBLE
            items = withContext(Dispatchers.Default) {
                InstalledAppsLoader.load(this@ScanActivity)
            }
            binding.progress.visibility = View.GONE
            binding.recycler.adapter = ScanListAdapter(buildScanRows(items))
        }
    }

    private fun buildScanRows(apps: List<ScannedApp>): List<ScanListItem> {
        val risky = apps.filter { it.localRiskScore >= 31 }
            .sortedByDescending { it.localRiskScore }
        val rest = apps.filter { it.localRiskScore < 31 }
            .sortedByDescending { it.localRiskScore }
        val out = ArrayList<ScanListItem>()
        if (risky.isNotEmpty()) {
            out.add(ScanListItem.Header(getString(R.string.section_risky)))
            risky.forEach { out.add(ScanListItem.AppRow(it)) }
        }
        if (rest.isNotEmpty()) {
            val titleRes = if (risky.isNotEmpty()) R.string.section_remaining else R.string.section_all
            out.add(ScanListItem.Header(getString(titleRes)))
            rest.forEach { out.add(ScanListItem.AppRow(it)) }
        }
        return out
    }

    private fun showSubmitFlow() {
        if (items.isEmpty()) {
            Toast.makeText(this, R.string.submit_fail, Toast.LENGTH_SHORT).show()
            return
        }
        val d = DialogSubmitScanBinding.inflate(layoutInflater)
        d.introText.setText(R.string.submit_dialog_intro)
        d.switchServer.text = getString(R.string.submit_server_switch)
        d.tilPhone.hint = getString(R.string.phone_hint)
        d.tilPhone.helperText = getString(R.string.phone_helper)

        val saved = Prefs.getPhone(this)
        val phoneStart = when {
            saved == null -> "+998 "
            saved.startsWith("anon:") -> "+998 "
            else -> UzbekPhoneFormatter.format(saved)
        }
        d.edtPhone.setText(phoneStart)
        d.edtPhone.setSelection(phoneStart.length)

        var selfChange = false
        d.edtPhone.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                if (selfChange) return
                val raw = s?.toString() ?: return
                val formatted = UzbekPhoneFormatter.format(raw)
                if (formatted != raw) {
                    selfChange = true
                    d.edtPhone.setText(formatted)
                    d.edtPhone.setSelection(formatted.length)
                    selfChange = false
                }
                d.tilPhone.error = null
            }
        })

        fun applyServerUi(checked: Boolean) {
            d.tilPhone.visibility = if (checked) View.VISIBLE else View.GONE
        }
        d.switchServer.isChecked = false
        applyServerUi(d.switchServer.isChecked)
        d.switchServer.setOnCheckedChangeListener { _, checked -> applyServerUi(checked) }

        val dialog = MaterialAlertDialogBuilder(this, R.style.ThemeOverlay_PhoneGuardian_LightAlertDialog)
            .setTitle(R.string.submit_cyber_review)
            .setView(d.root)
            .setPositiveButton(R.string.send, null)
            .setNegativeButton(R.string.cancel, null)
            .create()

        dialog.setOnShowListener {
            dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener {
                if (!d.switchServer.isChecked) {
                    dialog.dismiss()
                    Toast.makeText(this, R.string.submit_local_only, Toast.LENGTH_LONG).show()
                    return@setOnClickListener
                }
                val display = d.edtPhone.text?.toString()?.trim().orEmpty()
                val nat = UzbekPhoneFormatter.nationalDigitsFromAny(display)
                val phoneForApi = when {
                    PhoneUtils.isCompleteUzbekMobile(display) ->
                        UzbekPhoneFormatter.toE164(display)!!
                    nat.isEmpty() || display == "+998" || display == "+998 " ->
                        Prefs.getOrCreateAnonymousPhone(this)
                    else -> {
                        d.tilPhone.error = getString(R.string.phone_partial_error)
                        return@setOnClickListener
                    }
                }
                d.tilPhone.error = null
                dialog.dismiss()
                MaterialAlertDialogBuilder(this, R.style.ThemeOverlay_PhoneGuardian_LightAlertDialog)
                    .setTitle(R.string.consent_title)
                    .setMessage(R.string.consent_message)
                    .setNegativeButton(R.string.cancel, null)
                    .setPositiveButton(R.string.send) { _, _ ->
                        Prefs.setPhone(this, phoneForApi)
                        upload(phoneForApi)
                    }
                    .show()
            }
        }
        dialog.show()
    }

    private fun upload(phone: String) {
        lifecycleScope.launch {
            try {
                val device = DeviceInfoRequest(
                    brand = Build.BRAND,
                    model = Build.MODEL,
                    manufacturer = Build.MANUFACTURER,
                    androidVersion = Build.VERSION.RELEASE,
                    sdkVersion = Build.VERSION.SDK_INT,
                    securityPatch = Build.VERSION.SECURITY_PATCH,
                    deviceName = Build.DEVICE,
                )
                val apps = items.map {
                    InstalledAppPayload(
                        packageName = it.packageName,
                        appName = it.appLabel,
                        versionName = it.versionName,
                        versionCode = it.versionCode.coerceIn(0L, Int.MAX_VALUE.toLong()).toInt(),
                        installerPackage = it.installerPackage,
                        isSystemApp = it.isSystemApp,
                        requestedPermissions = it.requestedPermissions,
                        dangerousPermissions = it.dangerousPermissions,
                        localRiskScore = it.localRiskScore,
                        localRiskLevel = it.localRiskLevel,
                        riskReasons = it.riskReasons,
                    )
                }
                ApiClient.mobile.register(
                    MobileRegisterRequest(
                        phoneNumber = phone,
                        deviceModel = Build.MODEL,
                        androidVersion = Build.VERSION.RELEASE,
                        appVersion = BuildConfig.VERSION_NAME,
                    ),
                )
                ApiClient.mobile.submitScan(
                    MobileScanReportRequest(
                        phoneNumber = phone,
                        appVersion = BuildConfig.VERSION_NAME,
                        device = device,
                        installedApps = apps,
                    ),
                )
                Toast.makeText(this@ScanActivity, R.string.submit_ok, Toast.LENGTH_LONG).show()
            } catch (e: Exception) {
                if (BuildConfig.DEBUG) {
                    Log.e("PhoneGuardian", "submit failed: ${e.message}", e)
                    if (e is HttpException) {
                        val snippet = runCatching { e.response()?.errorBody()?.string() }.getOrNull()?.take(200)
                        Log.e("PhoneGuardian", "HTTP ${e.code()} body: $snippet")
                    }
                }
                val msg = when (e) {
                    is HttpException -> when (e.code()) {
                        413 -> getString(R.string.submit_payload_too_large)
                        in 500..599 -> getString(R.string.submit_fail_server)
                        else -> getString(R.string.submit_fail)
                    }
                    else -> getString(R.string.submit_fail)
                }
                Toast.makeText(this@ScanActivity, msg, Toast.LENGTH_LONG).show()
            }
        }
    }
}
