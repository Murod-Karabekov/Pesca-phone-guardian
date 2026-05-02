package com.pesca.phoneguardian.util

/**
 * Uzbek mobile: +998 XX XXX-XX-XX (9 raqam milliy qism).
 */
object UzbekPhoneFormatter {

    fun nationalDigitsFromAny(input: String): String {
        val d = input.filter { it.isDigit() }
        return when {
            d.startsWith("998") -> d.drop(3).take(9)
            else -> d.take(9)
        }
    }

    fun format(input: String): String {
        val n = nationalDigitsFromAny(input)
        return formatNational(n)
    }

    fun formatNational(national: String): String {
        val n = national.take(9)
        if (n.isEmpty()) return "+998 "
        val sb = StringBuilder("+998 ")
        sb.append(n.take(2))
        if (n.length <= 2) return sb.toString()
        sb.append(" ")
        val rest = n.drop(2)
        return when {
            rest.isEmpty() -> sb.toString()
            rest.length <= 3 -> sb.append(rest).toString()
            rest.length <= 5 -> sb.append(rest.take(3)).append("-").append(rest.drop(3)).toString()
            else -> sb.append(rest.take(3)).append("-")
                .append(rest.drop(3).take(2)).append("-")
                .append(rest.drop(5).take(2)).toString()
        }
    }

    /** +998XXXXXXXXX yoki null (to'liq emas). */
    fun toE164(display: String): String? {
        val nat = nationalDigitsFromAny(display)
        if (nat.length != 9) return null
        if (nat.first() != '9') return null
        return "+998$nat"
    }
}
