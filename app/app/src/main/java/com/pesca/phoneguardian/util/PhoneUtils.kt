package com.pesca.phoneguardian.util

object PhoneUtils {

    fun isCompleteUzbekMobile(display: String): Boolean =
        UzbekPhoneFormatter.toE164(display) != null
}
