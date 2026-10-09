package com.orbi.clima.widget

import androidx.compose.ui.graphics.Color

object OrbiWidgetTheme {
    val OrbiObsidian = Color(0xFF050814)
    val OrbiObsidianSoft = Color(0xFF0B1020)
    val OrbiCardBg = Color(0xFF0F172A)
    val OrbiCobalt = Color(0xFF2563EB)
    val OrbiCyan = Color(0xFF67E8F9)
    val OrbiAmber = Color(0xFFFBBF24)
    val OrbiSolar = Color(0xFFFFD166)
    val OrbiViolet = Color(0xFF8B5CF6)
    val OrbiGreen = Color(0xFF22C55E)
    val OrbiGreenSoft = Color(0xFF065F46)
    val OrbiOrange = Color(0xFFF97316)
    val OrbiRed = Color(0xFFEF4444)
    val OrbiText = Color(0xFFF8FAFC)
    val OrbiMutedText = Color(0xFFCBD5E1)
    val OrbiDim = Color(0xFF64748B)

    fun getRiskColor(riskLevel: String): Color {
        return when (riskLevel.lowercase()) {
            "low", "info" -> OrbiGreen
            "medium", "watch" -> OrbiAmber
            "high", "warning" -> OrbiOrange
            "critical" -> OrbiRed
            else -> OrbiCyan
        }
    }

    fun getConditionColor(conditionCode: String): Color {
        return when (conditionCode.lowercase()) {
            "sunny" -> OrbiAmber
            "partly_cloudy" -> OrbiCyan
            "cloudy" -> OrbiDim
            "rain" -> OrbiCobalt
            "storm" -> OrbiViolet
            "wind" -> OrbiCyan
            "cold" -> Color(0xFF38BDF8) // light ice blue
            "hot" -> OrbiRed
            "night" -> Color(0xFF4C1D95) // dark purple
            else -> OrbiCyan
        }
    }

    fun getSourceLabel(sourceMode: String): String {
        return when (sourceMode.lowercase()) {
            "live" -> "Live"
            "cached" -> "Cached"
            "mock" -> "Demo"
            "fallback" -> "Seguro"
            else -> "Live"
        }
    }
}
