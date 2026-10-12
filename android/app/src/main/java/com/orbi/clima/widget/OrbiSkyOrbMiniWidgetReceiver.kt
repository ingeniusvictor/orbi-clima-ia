package com.orbi.clima.widget

import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver

class OrbiSkyOrbMiniWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = OrbiSkyOrbMiniWidget()
}

class OrbiSkyOrbMiniWidget : OrbiExactNativeWidget(
    description = "ORBI SkyOrb Mini",
    fixedVariant = OrbiNativeWidgetSnapshotRendererV2.Variant.MINI,
)
