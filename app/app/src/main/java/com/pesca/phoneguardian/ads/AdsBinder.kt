package com.pesca.phoneguardian.ads

import android.content.Intent
import android.net.Uri
import android.view.LayoutInflater
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.view.isVisible
import coil.load
import com.pesca.phoneguardian.R
import com.pesca.phoneguardian.api.AdDto

object AdsBinder {

    fun populate(parent: LinearLayout, ads: List<AdDto>, inflater: LayoutInflater) {
        parent.removeAllViews()
        if (ads.isEmpty()) return
        for (ad in ads) {
            val card = inflater.inflate(R.layout.item_ad_card, parent, false)
            val image = card.findViewById<ImageView>(R.id.adImage)
            val title = card.findViewById<TextView>(R.id.adTitle)
            val linkPreview = card.findViewById<TextView>(R.id.adLinkPreview)
            title.text = ad.title?.trim()?.takeIf { it.isNotEmpty() } ?: ad.linkUrl
            linkPreview.text = ad.linkUrl
            if (!ad.imageUrl.isNullOrBlank()) {
                image.isVisible = true
                image.load(ad.imageUrl) {
                    crossfade(true)
                }
            } else {
                image.isVisible = false
            }
            val open = {
                parent.context.startActivity(
                    Intent(Intent.ACTION_VIEW, Uri.parse(ad.linkUrl)),
                )
            }
            card.setOnClickListener { open() }
            parent.addView(
                card,
                ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT,
                ),
            )
        }
    }
}
