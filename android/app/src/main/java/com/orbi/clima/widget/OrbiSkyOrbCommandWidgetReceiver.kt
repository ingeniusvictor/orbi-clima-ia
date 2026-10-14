package com.orbi.clima.widget

import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver

class OrbiSkyOrbCommandWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = OrbiSkyOrbCommandWidget()
}

class OrbiSkyOrbCommandWidget : OrbiExactNativeWidget(
    description = "ORBI SkyOrb Command",
    fixedVariant = OrbiNativeWidgetSnapshotRendererV2.Variant.COMMAND,
)
