package com.orbi.clima.widget

import androidx.compose.runtime.Composable
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
fun OrbiCinematicBarContent(state: OrbiWidgetContract) {
    val sourceLabel = OrbiWidgetTheme.getSourceLabel(state.sourceMode)

    Row(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(ColorProvider(OrbiWidgetTheme.OrbiObsidianSoft))
            .cornerRadius(16.dp)
            .padding(12.dp)
            .clickable(actionStartActivity<MainActivity>()),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(
            modifier = GlanceModifier
                .width(90.dp)
                .fillMaxHeight()
                .background(ColorProvider(OrbiWidgetTheme.OrbiObsidianSoft))
                .padding(6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            OrbiWidgetAtoms.OrbiClimateOrb(
                conditionCode = state.conditionCode,
                sizeDp = 36,
                orbAssetKey = state.orbAssetKey,
                weatherMood = state.weatherMood,
                visualTheme = state.visualTheme
            )
            Spacer(modifier = GlanceModifier.height(4.dp))
            Text(
                text = "${state.temperatureC}°",
                style = TextStyle(
                    color = ColorProvider(OrbiWidgetTheme.OrbiText),
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold
                )
            )
            Text(
                text = state.conditionLabel,
                style = TextStyle(
                    color = ColorProvider(OrbiWidgetTheme.OrbiMutedText),
                    fontSize = 8.sp,
                    fontWeight = FontWeight.Bold
                )
            )
        }

        Spacer(modifier = GlanceModifier.width(10.dp))

        Column(
            modifier = GlanceModifier.defaultWeight().fillMaxHeight(),
            verticalAlignment = Alignment.Top
        ) {
            Row(
                modifier = GlanceModifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalAlignment = Alignment.Start
            ) {
                Text(
                    text = "ORBI CINEMATIC BAR",
                    style = TextStyle(
                        color = ColorProvider(OrbiWidgetTheme.OrbiCyan),
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Bold
                    )
                )
                Spacer(modifier = GlanceModifier.defaultWeight())
                Text(
                    text = state.locationName,
                    style = TextStyle(
                        color = ColorProvider(OrbiWidgetTheme.OrbiDim),
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Bold
                    )
                )
            }

            Spacer(modifier = GlanceModifier.defaultWeight())

            val isAlertActive = state.mainAlertTitle.isNotEmpty() &&
                    state.mainAlertTitle != "Sin alertas relevantes" &&
                    state.mainAlertTitle != "Sin alertas operativas críticas"

            val cinematicText = if (isAlertActive) {
                "${state.mainAlertTitle.uppercase()}: ${state.mainAlertMessage}"
            } else {
                state.shortNarrative
            }

            val textColor = if (isAlertActive) {
                OrbiWidgetTheme.getRiskColor(state.mainAlertSeverity)
            } else {
                OrbiWidgetTheme.OrbiText
            }

            Text(
                text = cinematicText,
                style = TextStyle(
                    color = ColorProvider(textColor),
                    fontSize = 9.5.sp
                ),
                maxLines = 2
            )

            Spacer(modifier = GlanceModifier.defaultWeight())

            Row(
                modifier = GlanceModifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(modifier = GlanceModifier.defaultWeight().background(ColorProvider(OrbiWidgetTheme.OrbiCardBg)).padding(horizontal = 4.dp, vertical = 2.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(text = state.nextHour1Label, style = TextStyle(color = ColorProvider(OrbiWidgetTheme.OrbiDim), fontSize = 7.5.sp))
                        Spacer(modifier = GlanceModifier.width(3.dp))
                        Text(text = "${state.nextHour1Temp}°", style = TextStyle(color = ColorProvider(OrbiWidgetTheme.OrbiText), fontSize = 8.sp, fontWeight = FontWeight.Bold))
                    }
                }
                Spacer(modifier = GlanceModifier.width(3.dp))
                Box(modifier = GlanceModifier.defaultWeight().background(ColorProvider(OrbiWidgetTheme.OrbiCardBg)).padding(horizontal = 4.dp, vertical = 2.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(text = state.nextHour2Label, style = TextStyle(color = ColorProvider(OrbiWidgetTheme.OrbiDim), fontSize = 7.5.sp))
                        Spacer(modifier = GlanceModifier.width(3.dp))
                        Text(text = "${state.nextHour2Temp}°", style = TextStyle(color = ColorProvider(OrbiWidgetTheme.OrbiText), fontSize = 8.sp, fontWeight = FontWeight.Bold))
                    }
                }
                Spacer(modifier = GlanceModifier.width(3.dp))
                Box(modifier = GlanceModifier.defaultWeight().background(ColorProvider(OrbiWidgetTheme.OrbiCardBg)).padding(horizontal = 4.dp, vertical = 2.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(text = state.nextHour3Label, style = TextStyle(color = ColorProvider(OrbiWidgetTheme.OrbiDim), fontSize = 7.5.sp))
                        Spacer(modifier = GlanceModifier.width(3.dp))
                        Text(text = "${state.nextHour3Temp}°", style = TextStyle(color = ColorProvider(OrbiWidgetTheme.OrbiText), fontSize = 8.sp, fontWeight = FontWeight.Bold))
                    }
                }
            }

            Spacer(modifier = GlanceModifier.defaultWeight())

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
                    text = "$sourceLabel • ${state.lastUpdated}",
                    style = TextStyle(
                        color = ColorProvider(OrbiWidgetTheme.OrbiDim),
                        fontSize = 7.sp
                    )
                )
            }
        }
    }
}
