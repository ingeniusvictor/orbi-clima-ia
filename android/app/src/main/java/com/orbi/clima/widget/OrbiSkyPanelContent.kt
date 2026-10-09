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
fun OrbiSkyPanelContent(state: OrbiWidgetContract) {
    val isApt = state.globalDecisionLabel.lowercase() in listOf("óptimo", "favorable", "optimo")

    val badgeText = when {
        state.conditionCode.lowercase() == "setup" || state.locationName.lowercase().contains("configurar") -> "SETUP"
        state.sourceMode.lowercase() == "live" -> "LIVE"
        state.sourceMode.lowercase() == "cached" || state.sourceMode.lowercase() == "cache" -> "CACHE"
        state.sourceMode.lowercase() == "gps" -> "GPS"
        else -> "LIVE"
    }

    val badgeColor = when (badgeText) {
        "SETUP" -> OrbiWidgetTheme.OrbiAmber
        "LIVE" -> OrbiWidgetTheme.OrbiGreen
        "CACHE" -> OrbiWidgetTheme.OrbiCyan
        "GPS" -> OrbiWidgetTheme.OrbiViolet
        else -> OrbiWidgetTheme.OrbiGreen
    }

    Column(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(ColorProvider(OrbiWidgetTheme.OrbiObsidianSoft))
            .cornerRadius(16.dp)
            .padding(12.dp)
            .clickable(actionStartActivity<MainActivity>()),
        verticalAlignment = Alignment.Top,
        horizontalAlignment = Alignment.Start
    ) {
        Row(
            modifier = GlanceModifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalAlignment = Alignment.Start
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = "ORBI Clima IA",
                    style = TextStyle(
                        color = ColorProvider(OrbiWidgetTheme.OrbiText),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                )
                Spacer(modifier = GlanceModifier.width(4.dp))
                Text(
                    text = "SkyOrb",
                    style = TextStyle(
                        color = ColorProvider(OrbiWidgetTheme.OrbiCyan),
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Medium
                    )
                )
            }

            Spacer(modifier = GlanceModifier.defaultWeight())

            Box(
                modifier = GlanceModifier
                    .background(ColorProvider(badgeColor.copy(alpha = 0.15f)))
                    .cornerRadius(4.dp)
                    .padding(horizontal = 6.dp, vertical = 2.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = badgeText,
                    style = TextStyle(
                        color = ColorProvider(badgeColor),
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Bold
                    )
                )
            }
        }

        Spacer(modifier = GlanceModifier.height(8.dp))

        Row(
            modifier = GlanceModifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OrbiWidgetAtoms.OrbiClimateOrb(
                conditionCode = state.conditionCode,
                sizeDp = 34,
                orbAssetKey = state.orbAssetKey,
                weatherMood = state.weatherMood,
                visualTheme = state.visualTheme
            )

            Spacer(modifier = GlanceModifier.width(8.dp))

            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "${state.temperatureC}°C",
                        style = TextStyle(
                            color = ColorProvider(OrbiWidgetTheme.OrbiText),
                            fontSize = 19.sp,
                            fontWeight = FontWeight.Bold
                        )
                    )
                    Spacer(modifier = GlanceModifier.width(6.dp))
                    Text(
                        text = state.globalDecisionLabel,
                        style = TextStyle(
                            color = ColorProvider(if (isApt) OrbiWidgetTheme.OrbiGreen else OrbiWidgetTheme.OrbiAmber),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
                Text(
                    text = "${state.locationName} • ${state.conditionLabel}",
                    style = TextStyle(
                        color = ColorProvider(OrbiWidgetTheme.OrbiMutedText),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Medium
                    )
                )
            }
        }

        Spacer(modifier = GlanceModifier.height(8.dp))

        val isAlertActive = state.mainAlertTitle.isNotEmpty() &&
                state.mainAlertTitle != "Sin alertas relevantes" &&
                state.mainAlertTitle != "Sin alertas operativas críticas"

        val displayText = if (isAlertActive) {
            "Alerta: ${state.mainAlertTitle} (${state.mainAlertTimeLabel}) - ${state.mainAlertMessage}"
        } else {
            "\"${state.shortNarrative}\""
        }

        val displayColor = if (isAlertActive) {
            OrbiWidgetTheme.getRiskColor(state.mainAlertSeverity)
        } else {
            OrbiWidgetTheme.OrbiText
        }

        Text(
            text = displayText,
            style = TextStyle(
                color = ColorProvider(displayColor),
                fontSize = 10.sp
            ),
            maxLines = 2
        )

        Spacer(modifier = GlanceModifier.height(6.dp))

        Row(
            modifier = GlanceModifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalAlignment = Alignment.Start
        ) {
            Text(
                text = "Ventana: ${state.bestWindow}",
                style = TextStyle(
                    color = ColorProvider(OrbiWidgetTheme.OrbiDim),
                    fontSize = 8.sp,
                    fontWeight = FontWeight.Bold
                )
            )
            Spacer(modifier = GlanceModifier.defaultWeight())
            Text(
                text = "ORBI SkyCore™",
                style = TextStyle(
                    color = ColorProvider(OrbiWidgetTheme.OrbiCyan),
                    fontSize = 8.sp,
                    fontWeight = FontWeight.Bold
                )
            )
        }
    }
}
