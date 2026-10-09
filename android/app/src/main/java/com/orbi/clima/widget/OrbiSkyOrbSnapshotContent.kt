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

// Helpers for the origin badges
private fun getOriginBadgeLabel(sourceMode: String): String {
    return when (sourceMode.lowercase()) {
        "gps" -> "GPS"
        "saved", "guardada" -> "GUARDADA"
        "destination", "destino" -> "DESTINO"
        "manual" -> "MANUAL"
        "cache" -> "CACHE"
        "demo", "mock" -> "DEMO"
        else -> sourceMode.uppercase()
    }
}

private fun getOriginBadgeColor(sourceMode: String): Color {
    return when (sourceMode.lowercase()) {
        "gps" -> OrbiWidgetTheme.OrbiCyan
        "saved", "guardada" -> OrbiWidgetTheme.OrbiGreen
        "destination", "destino" -> OrbiWidgetTheme.OrbiViolet
        "manual" -> OrbiWidgetTheme.OrbiMutedText
        "cache" -> OrbiWidgetTheme.OrbiDim
        "demo", "mock" -> OrbiWidgetTheme.OrbiAmber
        else -> OrbiWidgetTheme.OrbiCyan
    }
}

/**
 * 1. SkyOrb 2x2: solo esfera + temperatura + ciudad + badge de origen
 */
@Composable
fun OrbiSkyOrb2x2Content(state: OrbiWidgetContract) {
    val originColor = getOriginBadgeColor(state.sourceMode)
    val originText = getOriginBadgeLabel(state.sourceMode)

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
        // Top Origin Badge and Title
        Row(
            modifier = GlanceModifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalAlignment = Alignment.SpaceBetween
        ) {
            Text(
                text = "SKYORB",
                style = TextStyle(
                    color = ColorProvider(OrbiWidgetTheme.OrbiCyan),
                    fontSize = 8.sp,
                    fontWeight = FontWeight.Bold
                )
            )
            Box(
                modifier = GlanceModifier
                    .background(ColorProvider(OrbiWidgetTheme.OrbiObsidianSoft))
                    .padding(horizontal = 4.dp, vertical = 1.dp)
            ) {
                Text(
                    text = originText,
                    style = TextStyle(
                        color = ColorProvider(originColor),
                        fontSize = 7.sp,
                        fontWeight = FontWeight.Bold
                    )
                )
            }
        }

        Spacer(modifier = GlanceModifier.height(6.dp))

        // Core Static Climate Sphere
        OrbiWidgetAtoms.OrbiClimateOrb(
            conditionCode = state.conditionCode,
            sizeDp = 44,
            orbAssetKey = state.orbAssetKey,
            weatherMood = state.weatherMood,
            visualTheme = state.visualTheme
        )

        Spacer(modifier = GlanceModifier.height(4.dp))

        // Temperature & Location Name
        Text(
            text = "${state.temperatureC}°",
            style = TextStyle(
                color = ColorProvider(OrbiWidgetTheme.OrbiText),
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold
            )
        )

        Text(
            text = state.locationName,
            style = TextStyle(
                color = ColorProvider(OrbiWidgetTheme.OrbiText),
                fontSize = 9.sp,
                fontWeight = FontWeight.Medium
            ),
            maxLines = 1
        )

        Spacer(modifier = GlanceModifier.height(2.dp))

        // Weather state label
        Text(
            text = state.conditionLabel.uppercase(),
            style = TextStyle(
                color = ColorProvider(OrbiWidgetTheme.OrbiMutedText),
                fontSize = 7.sp,
                fontWeight = FontWeight.Bold
            )
        )
    }
}

/**
 * 2. SkyOrb 4x2: esfera + resumen diario (resumen clima + datos actuales/origen)
 */
@Composable
fun OrbiSkyOrb4x2Content(state: OrbiWidgetContract) {
    val originColor = getOriginBadgeColor(state.sourceMode)
    val originText = getOriginBadgeLabel(state.sourceMode)
    val riskColor = OrbiWidgetTheme.getRiskColor(state.riskLevel)

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
        // Header row
        Row(
            modifier = GlanceModifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalAlignment = Alignment.SpaceBetween
        ) {
            Text(
                text = "ORBI SKYORB SNAPSHOT",
                style = TextStyle(
                    color = ColorProvider(OrbiWidgetTheme.OrbiCyan),
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold
                )
            )
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = GlanceModifier
                        .background(ColorProvider(OrbiWidgetTheme.OrbiObsidianSoft))
                        .padding(horizontal = 4.dp, vertical = 1.dp)
                ) {
                    Text(
                        text = originText,
                        style = TextStyle(
                            color = ColorProvider(originColor),
                            fontSize = 7.sp,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
                Spacer(modifier = GlanceModifier.width(4.dp))
                Text(
                    text = state.lastUpdated,
                    style = TextStyle(
                        color = ColorProvider(OrbiWidgetTheme.OrbiDim),
                        fontSize = 7.sp
                    )
                )
            }
        }

        Spacer(modifier = GlanceModifier.height(8.dp))

        // Content Row: Left is Sphere + Temp, Right is climate narrative summary
        Row(
            modifier = GlanceModifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Left block
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                OrbiWidgetAtoms.OrbiClimateOrb(
                    conditionCode = state.conditionCode,
                    sizeDp = 36,
                    orbAssetKey = state.orbAssetKey,
                    weatherMood = state.weatherMood,
                    visualTheme = state.visualTheme
                )
                Spacer(modifier = GlanceModifier.width(6.dp))
                Column {
                    Text(
                        text = "${state.temperatureC}°",
                        style = TextStyle(
                            color = ColorProvider(OrbiWidgetTheme.OrbiText),
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold
                        )
                    )
                    Text(
                        text = state.locationName,
                        style = TextStyle(
                            color = ColorProvider(OrbiWidgetTheme.OrbiMutedText),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Medium
                        ),
                        maxLines = 1
                    )
                }
            }

            Spacer(modifier = GlanceModifier.width(12.dp))

            // Right block: Daily summary / narrative
            Column(modifier = GlanceModifier.defaultWeight()) {
                Text(
                    text = state.conditionLabel,
                    style = TextStyle(
                        color = ColorProvider(OrbiWidgetTheme.OrbiSolar),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                )
                Spacer(modifier = GlanceModifier.height(2.dp))
                Text(
                    text = state.shortNarrative,
                    style = TextStyle(
                        color = ColorProvider(OrbiWidgetTheme.OrbiText),
                        fontSize = 9.sp
                    ),
                    maxLines = 2
                )
            }
        }

        Spacer(modifier = GlanceModifier.height(6.dp))

        // Quick metrics footer row
        Row(
            modifier = GlanceModifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalAlignment = Alignment.SpaceBetween
        ) {
            Text(
                text = "Humedad: ${state.humidity}%  •  Viento: ${state.windSpeedKmh} km/h",
                style = TextStyle(
                    color = ColorProvider(OrbiWidgetTheme.OrbiDim),
                    fontSize = 8.sp,
                    fontWeight = FontWeight.Medium
                )
            )

            Box(
                modifier = GlanceModifier
                    .background(ColorProvider(riskColor.copy(alpha = 0.15f)))
                    .padding(horizontal = 5.dp, vertical = 2.dp)
            ) {
                Text(
                    text = state.mainRiskLabel.uppercase(),
                    style = TextStyle(
                        color = ColorProvider(riskColor),
                        fontSize = 7.sp,
                        fontWeight = FontWeight.Bold
                    )
                )
            }
        }
    }
}

/**
 * 3. SkyOrb 4x4: premium symmetric orbital bubble layout matching standard
 */
@Composable
fun OrbiSkyOrb4x4Content(state: OrbiWidgetContract) {
    val originColor = getOriginBadgeColor(state.sourceMode)
    val originText = getOriginBadgeLabel(state.sourceMode)
    val riskColor = OrbiWidgetTheme.getRiskColor(state.riskLevel)
    val isApt = state.globalDecisionLabel.lowercase() in listOf("óptimo", "favorable", "optimo")

    // Determine Badge Status and associated color
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
            .background(ColorProvider(OrbiWidgetTheme.OrbiObsidian))
            .cornerRadius(24.dp)
            .padding(12.dp)
            .clickable(actionStartActivity<MainActivity>()),
        verticalAlignment = Alignment.Top,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // 1. Premium Header Row
        Row(
            modifier = GlanceModifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalAlignment = Alignment.SpaceBetween
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
                    text = "SkyOrb v1.0.6",
                    style = TextStyle(
                        color = ColorProvider(OrbiWidgetTheme.OrbiCyan),
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Medium
                    )
                )
            }

            // Glassmorphic status badge
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

        Spacer(modifier = GlanceModifier.height(10.dp))

        // 2. Symmetric Orbital Grid (Left bubbles, centerpiece, right bubbles)
        Row(
            modifier = GlanceModifier.fillMaxWidth().defaultWeight(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // LEFT COLUMN (Bubbles for Lluvia & Viento)
            Column(
                modifier = GlanceModifier.defaultWeight(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Bubble 1: Lluvia
                OrbiWidgetAtoms.OrbiOrbitalBubble(
                    title = "LLUVIA",
                    value = "${state.rainProbability}%",
                    subtext = "Probab.",
                    iconResId = com.orbi.clima.R.drawable.orbi_widget_orb_rain,
                    color = OrbiWidgetTheme.OrbiCyan
                )
                Spacer(modifier = GlanceModifier.height(12.dp))
                // Bubble 2: Viento
                OrbiWidgetAtoms.OrbiOrbitalBubble(
                    title = "VIENTO",
                    value = "${state.windSpeedKmh} km/h",
                    subtext = "Velocidad",
                    iconResId = com.orbi.clima.R.drawable.orbi_widget_orb_wind,
                    color = OrbiWidgetTheme.OrbiCyan
                )
            }

            // CENTER COLUMN (Giant Central climate sphere, location name, and temperature)
            Column(
                modifier = GlanceModifier.defaultWeight().fillMaxHeight(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Large climatic sphere
                OrbiWidgetAtoms.OrbiClimateOrb(
                    conditionCode = state.conditionCode,
                    sizeDp = 64,
                    orbAssetKey = state.orbAssetKey,
                    weatherMood = state.weatherMood,
                    visualTheme = state.visualTheme
                )

                Spacer(modifier = GlanceModifier.height(4.dp))

                Text(
                    text = "${state.temperatureC}°",
                    style = TextStyle(
                        color = ColorProvider(OrbiWidgetTheme.OrbiText),
                        fontSize = 32.sp,
                        fontWeight = FontWeight.Bold
                    )
                )

                Text(
                    text = state.conditionLabel,
                    style = TextStyle(
                        color = ColorProvider(OrbiWidgetTheme.OrbiMutedText),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Medium
                    ),
                    maxLines = 1
                )

                Text(
                    text = state.locationName,
                    style = TextStyle(
                        color = ColorProvider(OrbiWidgetTheme.OrbiCyan),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    ),
                    maxLines = 1
                )

                Spacer(modifier = GlanceModifier.height(2.dp))

                Text(
                    text = "Sensación ${state.feelsLikeC}° • UV ${state.uvIndex}",
                    style = TextStyle(
                        color = ColorProvider(OrbiWidgetTheme.OrbiDim),
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Medium
                    )
                )
            }

            // RIGHT COLUMN (Bubbles for Humedad & Forecast)
            Column(
                modifier = GlanceModifier.defaultWeight(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Bubble 3: Humedad
                OrbiWidgetAtoms.OrbiOrbitalBubble(
                    title = "HUMEDAD",
                    value = "${state.humidity}%",
                    subtext = "Normal",
                    iconResId = com.orbi.clima.R.drawable.orbi_widget_orb_cloudy,
                    color = OrbiWidgetTheme.OrbiCyan
                )
                Spacer(modifier = GlanceModifier.height(12.dp))
                // Bubble 4: Forecast (Mañana)
                OrbiWidgetAtoms.OrbiOrbitalBubble(
                    title = "MAÑANA",
                    value = "${state.nextHour1Temp}°C",
                    subtext = state.nextHour1Label,
                    iconResId = when (state.conditionCode.lowercase()) {
                        "sunny", "clear" -> com.orbi.clima.R.drawable.orbi_widget_orb_sunny
                        "rain" -> com.orbi.clima.R.drawable.orbi_widget_orb_rain
                        else -> com.orbi.clima.R.drawable.orbi_widget_orb_cloudy
                    },
                    color = OrbiWidgetTheme.OrbiSolar
                )
            }
        }

        Spacer(modifier = GlanceModifier.height(10.dp))

        // 3. Bottom Cinematic AI narrative capsule matching the conceptual image
        Row(
            modifier = GlanceModifier
                .fillMaxWidth()
                .background(ColorProvider(OrbiWidgetTheme.OrbiObsidianSoft))
                .cornerRadius(12.dp)
                .padding(horizontal = 8.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalAlignment = Alignment.Start
        ) {
            Box(
                modifier = GlanceModifier
                    .background(ColorProvider(OrbiWidgetTheme.OrbiCyan.copy(alpha = 0.15f)))
                    .cornerRadius(6.dp)
                    .padding(horizontal = 6.dp, vertical = 2.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "ORBI IA",
                    style = TextStyle(
                        color = ColorProvider(OrbiWidgetTheme.OrbiCyan),
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Bold
                    )
                )
            }
            Spacer(modifier = GlanceModifier.width(6.dp))
            Text(
                text = state.shortNarrative,
                style = TextStyle(
                    color = ColorProvider(OrbiWidgetTheme.OrbiText),
                    fontSize = 8.sp,
                    fontWeight = FontWeight.Medium
                ),
                maxLines = 1
            )
        }
    }
}
