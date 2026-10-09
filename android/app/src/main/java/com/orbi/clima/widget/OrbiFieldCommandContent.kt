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
fun OrbiFieldCommandContent(state: OrbiWidgetContract) {
    val isApt = state.globalDecisionLabel.lowercase() in listOf("óptimo", "favorable", "optimo")
    val sourceLabel = OrbiWidgetTheme.getSourceLabel(state.sourceMode)

    Column(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(ColorProvider(OrbiWidgetTheme.OrbiObsidianSoft))
            .cornerRadius(16.dp)
            .padding(14.dp)
            .clickable(actionStartActivity<MainActivity>()),
        verticalAlignment = Alignment.Top,
        horizontalAlignment = Alignment.Start
    ) {
        Row(
            modifier = GlanceModifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalAlignment = Alignment.Start
        ) {
            Column {
                Text(
                    text = "ORBI FIELD COMMAND",
                    style = TextStyle(
                        color = ColorProvider(OrbiWidgetTheme.OrbiAmber),
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold
                    )
                )
                Text(
                    text = "${state.locationName} • Terreno",
                    style = TextStyle(
                        color = ColorProvider(OrbiWidgetTheme.OrbiText),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                )
            }
            Spacer(modifier = GlanceModifier.defaultWeight())
            Box(
                modifier = GlanceModifier
                    .background(ColorProvider(OrbiWidgetTheme.OrbiCardBg))
                    .padding(horizontal = 6.dp, vertical = 2.dp)
            ) {
                Text(
                    text = "OPERACIONES",
                    style = TextStyle(
                        color = ColorProvider(OrbiWidgetTheme.OrbiMutedText),
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Bold
                    )
                )
            }
        }

        Spacer(modifier = GlanceModifier.height(8.dp))

        Row(modifier = GlanceModifier.fillMaxWidth()) {
            Box(
                modifier = GlanceModifier
                    .defaultWeight()
                    .background(ColorProvider(OrbiWidgetTheme.OrbiObsidianSoft))
                    .padding(8.dp)
            ) {
                Column {
                    Text(
                        text = "CONDICIÓN",
                        style = TextStyle(color = ColorProvider(OrbiWidgetTheme.OrbiDim), fontSize = 7.sp, fontWeight = FontWeight.Bold)
                    )
                    Text(
                        text = state.globalDecisionLabel.uppercase(),
                        style = TextStyle(
                            color = ColorProvider(if (isApt) OrbiWidgetTheme.OrbiGreen else OrbiWidgetTheme.OrbiAmber),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
            }

            Spacer(modifier = GlanceModifier.width(6.dp))

            Box(
                modifier = GlanceModifier
                    .defaultWeight()
                    .background(ColorProvider(OrbiWidgetTheme.OrbiObsidianSoft))
                    .padding(8.dp)
            ) {
                Column {
                    Text(
                        text = "TEMP / SENS.",
                        style = TextStyle(color = ColorProvider(OrbiWidgetTheme.OrbiDim), fontSize = 7.sp, fontWeight = FontWeight.Bold)
                    )
                    Text(
                        text = "${state.temperatureC}°C / ${state.feelsLikeC}°C",
                        style = TextStyle(
                            color = ColorProvider(OrbiWidgetTheme.OrbiText),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
            }
        }

        Spacer(modifier = GlanceModifier.height(8.dp))

        Row(modifier = GlanceModifier.fillMaxWidth()) {
            OrbiWidgetAtoms.OrbiMetricChip(
                label = "Humedad",
                value = "${state.humidity}%",
                valueColor = if (state.humidity > 80) OrbiWidgetTheme.OrbiOrange else OrbiWidgetTheme.OrbiText
            )
            Spacer(modifier = GlanceModifier.width(4.dp))
            OrbiWidgetAtoms.OrbiMetricChip(
                label = "Viento",
                value = "${state.windSpeedKmh}k/h",
                valueColor = if (state.windSpeedKmh > 25) OrbiWidgetTheme.OrbiOrange else OrbiWidgetTheme.OrbiText
            )
            Spacer(modifier = GlanceModifier.width(4.dp))
            OrbiWidgetAtoms.OrbiMetricChip(
                label = "UV",
                value = "${state.uvIndex}",
                valueColor = if (state.uvIndex >= 6) OrbiWidgetTheme.OrbiRed else OrbiWidgetTheme.OrbiAmber
            )
            Spacer(modifier = GlanceModifier.width(4.dp))
            OrbiWidgetAtoms.OrbiMetricChip(
                label = "Lluvia",
                value = "${state.rainProbability}%",
                valueColor = if (state.rainProbability > 40) OrbiWidgetTheme.OrbiCobalt else OrbiWidgetTheme.OrbiText
            )
        }

        Spacer(modifier = GlanceModifier.height(8.dp))

        val isAlertActive = state.mainAlertTitle.isNotEmpty() &&
                state.mainAlertTitle != "Sin alertas relevantes" &&
                state.mainAlertTitle != "Sin alertas operativas críticas"

        val mitigationTitle = if (isAlertActive) {
            "ALERTA ACTIVA: ${state.mainAlertTitle.uppercase()}"
        } else {
            "MITIGACIÓN ACTIVA SKYCORE"
        }

        val mitigationText = if (isAlertActive) {
            "${state.mainAlertMessage} EPP: ${state.technicalRecommendation}"
        } else {
            state.technicalRecommendation
        }

        val titleColor = if (isAlertActive) {
            OrbiWidgetTheme.getRiskColor(state.mainAlertSeverity)
        } else {
            OrbiWidgetTheme.OrbiAmber
        }

        Column(
            modifier = GlanceModifier
                .fillMaxWidth()
                .background(ColorProvider(OrbiWidgetTheme.OrbiCardBg))
                .padding(8.dp)
        ) {
            Text(
                text = mitigationTitle,
                style = TextStyle(
                    color = ColorProvider(titleColor),
                    fontSize = 7.sp,
                    fontWeight = FontWeight.Bold
                )
            )
            Spacer(modifier = GlanceModifier.height(2.dp))
            Text(
                text = mitigationText,
                style = TextStyle(
                    color = ColorProvider(OrbiWidgetTheme.OrbiText),
                    fontSize = 9.sp
                ),
                maxLines = 2
            )
        }

        Spacer(modifier = GlanceModifier.height(8.dp))

        Text(
            text = "NOTA SEGURIDAD: Validar condiciones antes de abrir tableros.",
            style = TextStyle(
                color = ColorProvider(OrbiWidgetTheme.OrbiRed),
                fontSize = 8.sp,
                fontWeight = FontWeight.Bold
            )
        )

        Spacer(modifier = GlanceModifier.height(4.dp))

        Row(
            modifier = GlanceModifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalAlignment = Alignment.Start
        ) {
            Text(
                text = "Ventana segura: ${state.bestWindow}",
                style = TextStyle(
                    color = ColorProvider(OrbiWidgetTheme.OrbiDim),
                    fontSize = 8.sp
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
