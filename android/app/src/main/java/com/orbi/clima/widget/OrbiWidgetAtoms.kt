package com.orbi.clima.widget

import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceModifier
import androidx.glance.background
import androidx.glance.layout.*
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import androidx.glance.Image
import androidx.glance.ImageProvider
import androidx.glance.appwidget.cornerRadius
import com.orbi.clima.R

object OrbiWidgetAtoms {

    @Composable
    fun OrbiClimateOrb(
        conditionCode: String,
        sizeDp: Int = 36,
        orbAssetKey: String = "",
        weatherMood: String = "",
        visualTheme: String = "premium"
    ) {
        val assetKey = if (!orbAssetKey.isNullOrEmpty()) orbAssetKey else conditionCode
        val drawableResId = when (assetKey.lowercase()) {
            "sunny", "clear", "hot" -> R.drawable.orbi_widget_orb_sunny
            "rain", "drizzle" -> R.drawable.orbi_widget_orb_rain
            "storm", "thunderstorm" -> R.drawable.orbi_widget_orb_storm
            "cloudy", "partly_cloudy" -> R.drawable.orbi_widget_orb_cloudy
            "fog", "mist" -> R.drawable.orbi_widget_orb_fog
            "cold", "frost", "snow" -> R.drawable.orbi_widget_orb_cold
            "wind" -> R.drawable.orbi_widget_orb_wind
            else -> R.drawable.orbi_widget_orb_fallback
        }

        Box(
            modifier = GlanceModifier.size((sizeDp + 8).dp),
            contentAlignment = Alignment.Center
        ) {
            Image(
                provider = ImageProvider(drawableResId),
                contentDescription = "Climate Orb ($assetKey)",
                modifier = GlanceModifier.size(sizeDp.dp)
            )
        }
    }

    @Composable
    fun OrbiHeaderRow(appName: String, sourceMode: String, lastUpdated: String) {
        val sourceLabel = OrbiWidgetTheme.getSourceLabel(sourceMode)
        Row(
            modifier = GlanceModifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalAlignment = Alignment.SpaceBetween
        ) {
            Text(
                text = appName,
                style = TextStyle(
                    color = ColorProvider(OrbiWidgetTheme.OrbiCyan),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
            )
            Text(
                text = "$sourceLabel • $lastUpdated",
                style = TextStyle(
                    color = ColorProvider(OrbiWidgetTheme.OrbiMutedText),
                    fontSize = 8.sp,
                    fontWeight = FontWeight.Medium
                )
            )
        }
    }

    @Composable
    fun OrbiMetricChip(label: String, value: String, valueColor: Color = OrbiWidgetTheme.OrbiText) {
        Box(
            modifier = GlanceModifier
                .background(ColorProvider(OrbiWidgetTheme.OrbiCardBg))
                .padding(horizontal = 6.dp, vertical = 4.dp),
            contentAlignment = Alignment.CenterStart
        ) {
            Column(horizontalAlignment = Alignment.Start) {
                Text(
                    text = label.uppercase(),
                    style = TextStyle(
                        color = ColorProvider(OrbiWidgetTheme.OrbiDim),
                        fontSize = 7.sp,
                        fontWeight = FontWeight.Bold
                    )
                )
                Text(
                    text = value,
                    style = TextStyle(
                        color = ColorProvider(valueColor),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                )
            }
        }
    }

    @Composable
    fun OrbiOrbitalBubble(
        title: String,
        value: String,
        subtext: String,
        iconResId: Int,
        color: Color,
        modifier: GlanceModifier = GlanceModifier
    ) {
        Column(
            modifier = modifier
                .background(ColorProvider(OrbiWidgetTheme.OrbiObsidianSoft))
                .cornerRadius(12.dp)
                .padding(6.dp)
                .width(68.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = GlanceModifier
                    .size(24.dp)
                    .background(ColorProvider(color.copy(alpha = 0.12f)))
                    .cornerRadius(12.dp),
                contentAlignment = Alignment.Center
            ) {
                Image(
                    provider = ImageProvider(iconResId),
                    contentDescription = title,
                    modifier = GlanceModifier.size(16.dp)
                )
            }
            Spacer(modifier = GlanceModifier.height(3.dp))
            Text(
                text = title,
                style = TextStyle(
                    color = ColorProvider(OrbiWidgetTheme.OrbiDim),
                    fontSize = 7.sp,
                    fontWeight = FontWeight.Bold
                )
            )
            Text(
                text = value,
                style = TextStyle(
                    color = ColorProvider(OrbiWidgetTheme.OrbiText),
                    fontSize = 8.sp,
                    fontWeight = FontWeight.Bold
                )
            )
            if (subtext.isNotEmpty()) {
                Text(
                    text = subtext,
                    style = TextStyle(
                        color = ColorProvider(OrbiWidgetTheme.OrbiDim),
                        fontSize = 6.sp,
                        fontWeight = FontWeight.Medium
                    )
                )
            }
        }
    }
}
