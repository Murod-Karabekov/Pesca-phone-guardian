package com.pesca.phoneguardian.scan

import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.ContextWrapper
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import android.view.LayoutInflater
import android.view.ViewGroup
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.pesca.phoneguardian.R
import com.pesca.phoneguardian.databinding.ItemScanAppBinding
import com.pesca.phoneguardian.databinding.ItemScanHeaderBinding

class ScanListAdapter(
    private val items: List<ScanListItem>,
) : RecyclerView.Adapter<RecyclerView.ViewHolder>() {

    companion object {
        private const val TYPE_HEADER = 0
        private const val TYPE_APP = 1
    }

    class HeaderVH(val binding: ItemScanHeaderBinding) : RecyclerView.ViewHolder(binding.root)
    class AppVH(val binding: ItemScanAppBinding) : RecyclerView.ViewHolder(binding.root)

    override fun getItemViewType(position: Int): Int = when (items[position]) {
        is ScanListItem.Header -> TYPE_HEADER
        is ScanListItem.AppRow -> TYPE_APP
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val inf = LayoutInflater.from(parent.context)
        return when (viewType) {
            TYPE_HEADER -> HeaderVH(ItemScanHeaderBinding.inflate(inf, parent, false))
            else -> AppVH(ItemScanAppBinding.inflate(inf, parent, false))
        }
    }

    override fun getItemCount() = items.size

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        when (val row = items[position]) {
            is ScanListItem.Header -> (holder as HeaderVH).binding.title.text = row.title
            is ScanListItem.AppRow -> bindApp((holder as AppVH).binding, row.app)
        }
    }

    private fun bindApp(b: ItemScanAppBinding, app: ScannedApp) {
        val ctx = b.root.context
        b.appName.setTextColor(ContextCompat.getColor(ctx, R.color.scan_text_main))
        b.packageName.setTextColor(ContextCompat.getColor(ctx, R.color.scan_text_muted))
        b.riskLine.setTextColor(ContextCompat.getColor(ctx, R.color.scan_text_main))
        b.reasons.setTextColor(ContextCompat.getColor(ctx, R.color.scan_text_reason))

        b.appName.text = app.appLabel
        b.packageName.text = app.packageName
        b.riskLine.text = ctx.getString(R.string.scan_risk_line, app.localRiskScore)
        b.reasons.text = app.riskReasons.joinToString(" · ").ifEmpty { ctx.getString(R.string.scan_no_reasons) }

        val (bg, fg) = riskColors(ctx, app.localRiskLevel)
        b.riskBadge.text = app.localRiskLevel
        b.riskBadge.setBackgroundColor(bg)
        b.riskBadge.setTextColor(fg)

        b.btnUninstall.setOnClickListener {
            openApplicationDetails(ctx, app.packageName)
        }
    }

    /** Tizim Sozlamalari → ilova kartasi (o‘chirish / to‘xtatish shu yerda). */
    private fun openApplicationDetails(context: Context, packageName: String) {
        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
            data = Uri.fromParts("package", packageName, null)
            if (context.findHostActivity() == null) {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
        }
        try {
            context.startActivity(intent)
        } catch (_: ActivityNotFoundException) {
            Toast.makeText(context, R.string.uninstall_not_supported, Toast.LENGTH_LONG).show()
        }
    }

    private fun Context.findHostActivity(): Activity? {
        var c: Context = this
        while (true) {
            if (c is Activity) return c
            if (c is ContextWrapper) {
                val base = c.baseContext
                if (base === c) return null
                c = base
            } else {
                return null
            }
        }
    }

    private fun riskColors(ctx: android.content.Context, level: String): Pair<Int, Int> {
        return when (level) {
            "CRITICAL" -> Pair(
                ContextCompat.getColor(ctx, R.color.risk_chip_critical_bg),
                ContextCompat.getColor(ctx, R.color.risk_chip_critical_fg),
            )
            "HIGH" -> Pair(
                ContextCompat.getColor(ctx, R.color.risk_chip_high_bg),
                ContextCompat.getColor(ctx, R.color.risk_chip_high_fg),
            )
            "MEDIUM" -> Pair(
                ContextCompat.getColor(ctx, R.color.risk_chip_medium_bg),
                ContextCompat.getColor(ctx, R.color.risk_chip_medium_fg),
            )
            else -> Pair(
                ContextCompat.getColor(ctx, R.color.risk_chip_low_bg),
                ContextCompat.getColor(ctx, R.color.risk_chip_low_fg),
            )
        }
    }
}
