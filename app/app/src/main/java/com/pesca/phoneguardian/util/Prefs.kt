package com.pesca.phoneguardian.util

import android.content.Context
import java.util.UUID

object Prefs {
    private const val NAME = "ppg_prefs"
    private const val KEY_PHONE = "phone_e164"
    private const val KEY_ANON_ID = "anon_device_id"

    fun getPhone(context: Context): String? =
        context.getSharedPreferences(NAME, Context.MODE_PRIVATE).getString(KEY_PHONE, null)

    fun setPhone(context: Context, phone: String) {
        context.getSharedPreferences(NAME, Context.MODE_PRIVATE).edit()
            .putString(KEY_PHONE, phone.trim())
            .apply()
    }

    /** Barqaror anonim identifikator (telefon bermasdan serverga yuborish uchun). */
    fun getOrCreateAnonymousPhone(context: Context): String {
        val sp = context.getSharedPreferences(NAME, Context.MODE_PRIVATE)
        val existing = sp.getString(KEY_ANON_ID, null)
        if (existing != null) return "anon:$existing"
        val id = UUID.randomUUID().toString()
        sp.edit().putString(KEY_ANON_ID, id).apply()
        return "anon:$id"
    }
}
