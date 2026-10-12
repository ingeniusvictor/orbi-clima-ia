package com.orbi.clima.widget

import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver

class OrbiSkyOrbPanelWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = OrbiSkyOrbPanelWidget()
}

class OrbiSkyOrbPanelWidget : OrbiExactNativeWidget(
    description = "ORBI SkyPanel",
    fixedVariant = OrbiNativeWidgetSnapshotRendererV2.Variant.PANEL,
)
