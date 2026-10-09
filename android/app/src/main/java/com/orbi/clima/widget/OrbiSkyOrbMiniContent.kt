package com.orbi.clima.widget

import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceModifier
import androidx.glance.action.actionStartActivity
import androidx.glance.action.clickable
import androidx.glance.background
import androidx.glance.layout.*
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import androidx.glance.appwidget.cornerRadius
import com.orbi.clima.MainActivity

@Composable
fun OrbiSkyOrbMiniContent(state: OrbiWidgetContract) {
    val riskColor = OrbiWidgetTheme.getRiskColor(state.riskLevel)
    val isApt = state.globalDecisionLabel.lowercase() in listOf("óptimo", "favorable", "optimo")
    val sourceLabel = OrbiWidgetTheme.getSourceLabel(state.sourceMode)

    Column(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(ColorProvider(OrbiWidgetTheme.OrbiObsidianSoft))
            .cornerRadius(16.dp)
            .padding(10.dp)
            .clickable(actionStartActivity<MainActivity>()),
        verticalAlignment = Alignment.CenterVertically,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Core climate sphere
        OrbiWidgetAtoms.OrbiClimateOrb(
            conditionCode = state.conditionCode,
            sizeDp = 42,
            orbAssetKey = state.orbAssetKey,
            weatherMood = state.weatherMood,
            visualTheme = state.visualTheme
        )

        Spacer(modifier = GlanceModifier.height(4.dp))

        // Large Temperature block
        Text(
            text = "${state.temperatureC}°",
            style = TextStyle(
                color = ColorProvider(OrbiWidgetTheme.OrbiText),
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold
            )
        )

        Spacer(modifier = GlanceModifier.height(2.dp))

        // Decision label (Apt or cautious)
        Text(
            text = state.globalDecisionLabel,
            style = TextStyle(
                color = ColorProvider(if (isApt) OrbiWidgetTheme.OrbiGreen else OrbiWidgetTheme.OrbiAmber),
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold
            )
        )

        Spacer(modifier = GlanceModifier.height(2.dp))

        // Risk badge
        Text(
            text = state.mainRiskLabel,
            style = TextStyle(
                color = ColorProvider(riskColor),
                fontSize = 8.sp,
                fontWeight = FontWeight.Medium
            )
        )

        Spacer(modifier = GlanceModifier.height(4.dp))

        // Source mode status
        Text(
            text = "$sourceLabel • ${state.lastUpdated}",
            style = TextStyle(
                color = ColorProvider(OrbiWidgetTheme.OrbiDim),
                fontSize = 7.sp
            )
        )
    }
}
